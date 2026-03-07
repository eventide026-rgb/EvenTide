
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  PlusCircle,
  Users,
  Search,
  Building,
  Briefcase,
  Settings,
  LogOut,
  Home,
  MessageSquare,
  Gift,
  FileText,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useUser } from "@/firebase"

export function CommandCenter() {
  const [open, setOpen] = React.useState(false)
  const { user } = useUser()
  const router = useRouter()
  
  // Use session storage for quick role detection
  const [role, setRole] = React.useState<string | null>(null)

  React.useEffect(() => {
    setRole(sessionStorage.getItem('userRole'))
  }, [user])

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
              <Home className="mr-2 h-4 w-4" />
              <span>Home</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/resources/how-to-use"))}>
              <Search className="mr-2 h-4 w-4" />
              <span>How to use EvenTide</span>
            </CommandItem>
          </CommandGroup>

          {role === 'Owner' && (
            <CommandGroup heading="Owner Controls">
              <CommandItem onSelect={() => runCommand(() => router.push("/owner/create-event"))}>
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Create New Event</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/owner/guests"))}>
                <Users className="mr-2 h-4 w-4" />
                <span>Manage Guest List</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/owner/calendar"))}>
                <Calendar className="mr-2 h-4 w-4" />
                <span>My Event Calendar</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/owner/find-planner"))}>
                <Building className="mr-2 h-4 w-4" />
                <span>Find a Planner</span>
              </CommandItem>
            </CommandGroup>
          )}

          {role === 'Planner' && (
            <CommandGroup heading="Planner Tools">
              <CommandItem onSelect={() => runCommand(() => router.push("/planner/events"))}>
                <Briefcase className="mr-2 h-4 w-4" />
                <span>View Assigned Gigs</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/planner/vendor-hub"))}>
                <Users className="mr-2 h-4 w-4" />
                <span>Browse Vendor Marketplace</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/planner/tasks"))}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Task Board</span>
              </CommandItem>
            </CommandGroup>
          )}

          {role === 'Vendor' && (
            <CommandGroup heading="Vendor Dashboard">
              <CommandItem onSelect={() => runCommand(() => router.push("/vendor/my-gigs"))}>
                <Briefcase className="mr-2 h-4 w-4" />
                <span>My Active Gigs</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/vendor/proposals"))}>
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>View Proposals</span>
              </CommandItem>
            </CommandGroup>
          )}

          <CommandSeparator />
          
          <CommandGroup heading="Marketplace">
            <CommandItem onSelect={() => runCommand(() => router.push("/shows"))}>
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>Buy Tickets</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/resources/hotels"))}>
              <Building className="mr-2 h-4 w-4" />
              <span>Book a Hotel</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/resources/venues"))}>
              <Building className="mr-2 h-4 w-4" />
              <span>Find a Venue</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => runCommand(() => router.push("/account"))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Account Settings</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => { sessionStorage.clear(); router.push("/login"); })}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
