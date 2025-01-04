'use client'

import { useTheme } from 'next-themes'
import {
  DropdownMenu, DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Moon, Sun, SunMoon } from 'lucide-react'
import { useEffect, useState } from 'react'

const ModeToggle = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="focus-visible:ring-0 focus-visible:ring-offset-0">
        <Button variant="ghost">
          {theme === 'system' ? <SunMoon /> : theme === 'dark' ? <Moon /> : <Sun />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={theme === 'system'} onClick={() => setTheme('system')}>
          System
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={theme === 'dark'} onClick={() => setTheme('dark')}>
          Dark
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={theme === 'light'} onClick={() => setTheme('light')}>
          Light
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ModeToggle
