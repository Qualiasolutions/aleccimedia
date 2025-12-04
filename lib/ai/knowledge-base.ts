import fs from "fs/promises";
import path from "path";

const KNOWLEDGE_BASE_PATH = path.join(process.cwd(), "Knowledge Base");

// Memory cache for knowledge base content
const cache = new Map<string, { content: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    const { PDFParse } = await import("pdf-parse");
    const pdfParse = new PDFParse({ data: buffer });
    // @ts-expect-error - pdf-parse v2 marks load() as private but it needs to be called
    await pdfParse.load();
    const result = await pdfParse.getText();
    // getText() returns TextResult which has a text property
    const text = typeof result === "string" ? result : result?.text ?? "";
    return text || "[Unable to extract text from PDF]";
  } catch {
    return "[Error parsing PDF file]";
  }
}

async function parseDOCX(buffer: Buffer): Promise<string> {
  try {
    const mammoth = (await import("mammoth")).default;
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "[Unable to extract text from DOCX]";
  } catch {
    return "[Error parsing DOCX file]";
  }
}

async function parseXLSX(buffer: Buffer): Promise<string> {
  try {
    const XLSX = (await import("xlsx")).default;
    const workbook = XLSX.read(buffer, { type: "buffer" });
    let content = "";
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      if (sheet) {
        content += `\n## Sheet: ${sheetName}\n`;
        content += XLSX.utils.sheet_to_txt(sheet);
      }
    }
    return content || "[Empty spreadsheet]";
  } catch {
    return "[Error parsing XLSX file]";
  }
}

async function parseFile(filePath: string, fileName: string): Promise<string> {
  const ext = path.extname(fileName).toLowerCase();

  // Text-based files
  if (ext === ".md" || ext === ".txt") {
    return await fs.readFile(filePath, "utf-8");
  }

  // Binary files that need parsing
  const buffer = await fs.readFile(filePath);

  if (ext === ".pdf") {
    return await parsePDF(buffer);
  }

  if (ext === ".docx" || ext === ".doc") {
    return await parseDOCX(buffer);
  }

  if (ext === ".xlsx" || ext === ".xls") {
    return await parseXLSX(buffer);
  }

  // Skip video/audio/image files
  if ([".mp4", ".mp3", ".wav", ".jpg", ".jpeg", ".png", ".gif", ".webp", ".pptx", ".ppt"].includes(ext)) {
    return `[Media file: ${fileName} - content not extracted]`;
  }

  return `[Unsupported file format: ${ext}]`;
}

async function readDirectoryContent(dirPath: string): Promise<string> {
  try {
    await fs.access(dirPath);
  } catch {
    return "";
  }

  const files = await fs.readdir(dirPath, { withFileTypes: true });
  const contentParts: string[] = [];

  // Process files in parallel for better performance
  const filePromises = files
    .filter((file) => file.isFile())
    .map(async (file) => {
      const filePath = path.join(dirPath, file.name);
      try {
        const fileContent = await parseFile(filePath, file.name);
        return `\n\n--- ${file.name} ---\n${fileContent}`;
      } catch {
        return `\n\n--- ${file.name} ---\n[Error reading file]`;
      }
    });

  const results = await Promise.all(filePromises);
  contentParts.push(...results);

  // Check for subdirectories
  for (const item of files) {
    if (item.isDirectory()) {
      const subDirPath = path.join(dirPath, item.name);
      const subContent = await readDirectoryContent(subDirPath);
      if (subContent) {
        contentParts.push(`\n\n=== Folder: ${item.name} ===\n${subContent}`);
      }
    }
  }

  return contentParts.join("");
}

export async function getKnowledgeBaseContent(
  botType: string
): Promise<string> {
  // Check cache first
  const cached = cache.get(botType);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.content;
  }

  try {
    let content = "";

    if (botType === "alexandria") {
      const dirPath = path.join(KNOWLEDGE_BASE_PATH, "Alexandria");
      content = await readDirectoryContent(dirPath);
    } else if (botType === "kim") {
      const dirPath = path.join(KNOWLEDGE_BASE_PATH, "Kim");
      content = await readDirectoryContent(dirPath);
    } else if (botType === "collaborative") {
      // Get both executives' knowledge plus shared content
      const alexandriaContent = await getKnowledgeBaseContent("alexandria");
      const kimContent = await getKnowledgeBaseContent("kim");
      const sharedPath = path.join(KNOWLEDGE_BASE_PATH, "Kim and Alex shared");
      const sharedContent = await readDirectoryContent(sharedPath);

      content = `\n\n=== Alexandria's Knowledge ===\n${alexandriaContent}\n\n=== Kim's Knowledge ===\n${kimContent}`;
      if (sharedContent) {
        content += `\n\n=== Shared Knowledge ===\n${sharedContent}`;
      }
    } else {
      return "";
    }

    // Cache the result
    cache.set(botType, { content, timestamp: Date.now() });

    return content;
  } catch {
    return "";
  }
}
