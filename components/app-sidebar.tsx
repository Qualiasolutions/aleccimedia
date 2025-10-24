"use client";

import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "next-auth";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { useMobileSidebar } from "@/components/mobile-sidebar-context";
import {
  getChatHistoryPaginationKey,
  SidebarHistory,
} from "@/components/sidebar-history";
import { SidebarUserNav } from "@/components/sidebar-user-nav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile, state } = useSidebar();
  const { mutate } = useSWRConfig();
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const { isMobileSidebarOpen, setIsMobileSidebarOpen } = useMobileSidebar();

  const handleDeleteAll = () => {
    const deletePromise = fetch("/api/history", {
      method: "DELETE",
    });

    toast.promise(deletePromise, {
      loading: "Deleting all chats...",
      success: () => {
        mutate(unstable_serialize(getChatHistoryPaginationKey));
        router.push("/");
        setShowDeleteAllDialog(false);
        setIsMobileSidebarOpen(false);
        return "All chats deleted successfully";
      },
      error: "Failed to delete all chats",
    });
  };

  const handleNewChat = () => {
    setOpenMobile(false);
    setIsMobileSidebarOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <Sidebar className="w-80 border-white/20 border-r bg-gradient-to-br from-white/95 to-white/90 shadow-2xl shadow-rose-200/30 backdrop-blur-xl">
        <SidebarHeader className="border-white/20 border-b bg-gradient-to-r from-white/80 to-white/60 px-6 py-6">
          <SidebarMenu>
            <div className="flex flex-col gap-4">
              <Link
                className="flex items-center justify-center"
                href="/"
                onClick={handleNewChat}
              >
                <motion.img
                  alt="Alecci Media Logo"
                  className="h-14 w-auto max-w-[240px] object-contain drop-shadow-md transition-shadow duration-300 hover:drop-shadow-lg"
                  src="https://images.squarespace-cdn.com/content/v1/5ea759fa9e5575487ad28cd0/1591228238957-80Y8AGN1M9TTXTYNJ5QK/AM_Logo_Horizontal_4C+%281%29.jpg?format=1500w"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                />
              </Link>

              <div className="flex gap-2">
                {user && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="hover:-translate-y-0.5 h-10 flex-1 rounded-xl border border-red-200/50 bg-white/80 text-red-600 shadow-md transition-all duration-200 hover:border-red-300 hover:bg-red-50 hover:shadow-lg"
                        onClick={() => setShowDeleteAllDialog(true)}
                        variant="outline"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span className="font-medium text-sm">Clear All</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete all chats</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="hover:-translate-y-0.5 h-10 flex-1 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg transition-all duration-200 hover:from-rose-600 hover:to-rose-700 hover:shadow-xl"
                      onClick={handleNewChat}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      <span className="font-medium text-sm">New Chat</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Start new conversation</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="flex-1 overflow-hidden px-4 py-6">
          <div className="scrollbar-thin scrollbar-thumb-rose-200 scrollbar-track-transparent h-full overflow-y-auto">
            <SidebarHistory user={user} />
          </div>
        </SidebarContent>

        <SidebarFooter className="border-white/20 border-t bg-gradient-to-r from-white/90 to-white/80 px-6 py-4 backdrop-blur">
        {/* Navigation Links */}
        <div className="mt-2 flex flex-col gap-1 rounded-xl bg-white/60 p-2">
          <Link href="/executives" onClick={() => setOpenMobile(false)}>
            <Button variant="ghost" className="w-full justify-start text-left text-sm hover:bg-rose-50">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Meet the Team
            </Button>
          </Link>
          <Link href="/history" onClick={() => setOpenMobile(false)}>
            <Button variant="ghost" className="w-full justify-start text-left text-sm hover:bg-rose-50">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History & Analytics
            </Button>
          </Link>
        </div>
          {user && <SidebarUserNav user={user} />}
        </SidebarFooter>
      </Sidebar>

      {/* Mobile Sidebar - using Sheet */}
      <div className="lg:hidden">
        <Sheet onOpenChange={setIsMobileSidebarOpen} open={isMobileSidebarOpen}>
          <SheetContent
            className="w-80 border-white/20 border-r bg-gradient-to-br from-white/95 to-white/90 p-0 backdrop-blur-xl"
            side="left"
          >
            <SheetHeader className="border-white/20 border-b bg-gradient-to-r from-white/80 to-white/60 px-6 py-6">
              <div className="flex flex-col gap-4">
                <Link
                  className="flex items-center justify-center"
                  href="/"
                  onClick={handleNewChat}
                >
                  <img
                    alt="Alecci Media Logo"
                    className="h-12 w-auto max-w-[220px] object-contain drop-shadow-md"
                    src="https://images.squarespace-cdn.com/content/v1/5ea759fa9e5575487ad28cd0/1591228238957-80Y8AGN1M9TTXTYNJ5QK/AM_Logo_Horizontal_4C+%281%29.jpg?format=1500w"
                  />
                </Link>

                <div className="flex gap-2">
                  {user && (
                    <Button
                      className="h-10 flex-1 rounded-xl border border-red-200/50 bg-white/80 text-red-600 text-sm shadow-md transition-all duration-200 hover:border-red-300 hover:bg-red-50 hover:shadow-lg"
                      onClick={() => setShowDeleteAllDialog(true)}
                      variant="outline"
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Clear
                    </Button>
                  )}

                  <Button
                    className="h-10 flex-1 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-sm text-white shadow-lg transition-all duration-200 hover:from-rose-600 hover:to-rose-700 hover:shadow-lg"
                    onClick={handleNewChat}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    New
                  </Button>
                </div>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-hidden px-4 py-6">
              <div className="scrollbar-thin scrollbar-thumb-rose-200 scrollbar-track-transparent h-full overflow-y-auto">
                <SidebarHistory user={user} />
              </div>
            </div>

            <div className="border-white/20 border-t bg-gradient-to-r from-white/90 to-white/80 px-6 py-4 backdrop-blur">
              {user && <SidebarUserNav user={user} />}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <AlertDialog
        onOpenChange={setShowDeleteAllDialog}
        open={showDeleteAllDialog}
      >
        <AlertDialogContent className="mx-4 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-semibold text-lg text-slate-900">
              Delete all chats?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              This action cannot be undone. This will permanently delete all
              your chats and remove them from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white transition-all duration-200 hover:from-red-600 hover:to-red-700"
              onClick={handleDeleteAll}
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
