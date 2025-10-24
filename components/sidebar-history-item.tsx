import Link from "next/link";
import { memo } from "react";
import { useChatVisibility } from "@/hooks/use-chat-visibility";
import type { Chat } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import {
  CheckCircleFillIcon,
  GlobeIcon,
  LockIcon,
  MoreHorizontalIcon,
  ShareIcon,
  TrashIcon,
} from "./icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";

const PureChatItem = ({
  chat,
  isActive,
  onDelete,
  setOpenMobile,
}: {
  chat: Chat;
  isActive: boolean;
  onDelete: (chatId: string) => void;
  setOpenMobile: (open: boolean) => void;
}) => {
  const { visibilityType, setVisibilityType } = useChatVisibility({
    chatId: chat.id,
    initialVisibilityType: chat.visibility,
  });

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link
          className="group relative my-3 flex min-h-[60px] flex-col justify-center rounded-xl border border-transparent px-3 py-4 transition-all duration-200 hover:border-rose-200 hover:bg-gradient-to-r hover:from-rose-50 hover:to-rose-100"
          href={`/chat/${chat.id}`}
          onClick={() => setOpenMobile(false)}
        >
          {/* Active state indicator */}
          {isActive && (
            <div className="-translate-y-1/2 absolute top-1/2 left-0 h-8 w-1 rounded-r-full bg-gradient-to-b from-rose-500 to-rose-600" />
          )}

          <div className="flex w-full items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="line-clamp-2 font-semibold text-slate-700 text-sm transition-colors group-hover:text-rose-600 group-data-[active=true]:text-rose-600">
                {chat.title}
              </span>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-medium text-xs transition-colors",
                    visibilityType === "public"
                      ? "bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200 group-data-[active=true]:bg-emerald-200"
                      : "bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-data-[active=true]:bg-slate-200"
                  )}
                >
                  {visibilityType === "public" ? "Public" : "Private"}
                </span>
              </div>
            </div>

            <div className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 transition-colors duration-200 group-hover:bg-rose-200">
                <svg
                  className="h-3 w-3 text-rose-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 5l7 7-7 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      </SidebarMenuButton>

      <DropdownMenu modal={true}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction
            className="mr-1 rounded-lg transition-colors duration-200 hover:bg-rose-100 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            showOnHover={!isActive}
          >
            <div className="flex h-4 w-4 items-center justify-center">
              <MoreHorizontalIcon size={16} />
            </div>
            <span className="sr-only">More</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="min-w-[160px] rounded-xl border border-white/20 bg-white/95 shadow-xl backdrop-blur-sm"
          side="bottom"
        >
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer rounded-lg transition-colors duration-200 hover:bg-rose-50">
              <div className="mr-2 flex h-4 w-4 items-center justify-center">
                <ShareIcon size={16} />
              </div>
              <span className="font-medium text-sm">Share</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="min-w-[140px] rounded-xl border border-white/20 bg-white/95 shadow-lg backdrop-blur-sm">
                <DropdownMenuItem
                  className="cursor-pointer flex-row justify-between rounded-lg px-3 py-2 transition-colors duration-200 hover:bg-rose-50"
                  onClick={() => {
                    setVisibilityType("private");
                  }}
                >
                  <div className="flex flex-row items-center gap-2">
                    <div className="text-slate-500">
                      <LockIcon size={14} />
                    </div>
                    <span className="font-medium text-sm">Private</span>
                  </div>
                  {visibilityType === "private" ? (
                    <div className="flex h-4 w-4 items-center justify-center">
                      <CheckCircleFillIcon
                        className="text-emerald-600"
                        size={16}
                      />
                    </div>
                  ) : null}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer flex-row justify-between rounded-lg px-3 py-2 transition-colors duration-200 hover:bg-rose-50"
                  onClick={() => {
                    setVisibilityType("public");
                  }}
                >
                  <div className="flex flex-row items-center gap-2">
                    <div className="flex h-4 w-4 items-center justify-center text-slate-500">
                      <GlobeIcon size={16} />
                    </div>
                    <span className="font-medium text-sm">Public</span>
                  </div>
                  {visibilityType === "public" ? (
                    <div className="flex h-4 w-4 items-center justify-center">
                      <CheckCircleFillIcon
                        className="text-emerald-600"
                        size={16}
                      />
                    </div>
                  ) : null}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuItem
            className="cursor-pointer rounded-lg px-3 py-2 text-red-600 transition-colors duration-200 hover:bg-red-50 focus:bg-red-50 focus:text-red-700"
            onSelect={() => onDelete(chat.id)}
          >
            <div className="mr-2 flex h-4 w-4 items-center justify-center">
              <TrashIcon size={16} />
            </div>
            <span className="font-medium text-sm">Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
  if (prevProps.isActive !== nextProps.isActive) {
    return false;
  }
  return true;
});
