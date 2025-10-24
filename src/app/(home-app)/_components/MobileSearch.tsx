"use client"

import {useState} from 'react'
import {Button} from '@/components/ui/button'
import {Search} from 'lucide-react'
import {Sheet, SheetContent, SheetTrigger} from '@/components/ui/sheet'
import {TopbarEventSearch} from './TopbarEventSearch'

export function MobileSearch() {
	const [open, setOpen] = useState(false)

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="md:hidden"
				>
					<Search className="h-5 w-5"/>
					<span className="sr-only">Search events</span>
				</Button>
			</SheetTrigger>
			<SheetContent side="top" className="md:hidden space-y-4 p-4">
				<TopbarEventSearch
					className="max-w-none"
					autoFocus
					onClose={() => setOpen(false)}
				/>
			</SheetContent>
		</Sheet>
	)
}
