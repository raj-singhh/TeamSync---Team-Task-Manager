"use client"

import { useState } from "react"
import { aiTaskSuggester } from "@/ai/flows/ai-task-suggester-flow"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Sparkles, Loader2, PlusCircle, Check } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"

interface AISuggestModalProps {
  projectDescription: string
}

export function AISuggestModal({ projectDescription }: AISuggestModalProps) {
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<{ subTasks: string[], actionItems: string[] } | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [open, setOpen] = useState(false)

  const handleSuggest = async () => {
    setLoading(true)
    try {
      const result = await aiTaskSuggester({ projectDescription })
      setSuggestions(result)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate suggestions. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleItem = (item: string) => {
    setSelectedItems(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    )
  }

  const handleAddTasks = () => {
    toast({
      title: "Success",
      description: `Added ${selectedItems.length} tasks to your project.`,
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-accent border-accent hover:bg-accent hover:text-white">
          <Sparkles className="mr-2 size-4" />
          AI Task Suggest
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-accent" />
            AI Task Suggester
          </DialogTitle>
          <DialogDescription>
            Based on your project description, our AI can suggest key sub-tasks and action items to get you started.
          </DialogDescription>
        </DialogHeader>

        {!suggestions ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
            <div className="size-16 rounded-full bg-accent/10 flex items-center justify-center">
              <Sparkles className="size-8 text-accent" />
            </div>
            <div>
              <p className="font-medium">Ready to brainstorm?</p>
              <p className="text-sm text-muted-foreground max-w-sm">
                We'll analyze "{projectDescription.substring(0, 50)}..." to suggest logical steps.
              </p>
            </div>
            <Button onClick={handleSuggest} disabled={loading} className="bg-accent hover:bg-accent/90">
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Generate Suggestions
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Suggested Tasks</h4>
                  <div className="space-y-2">
                    {suggestions.subTasks.map((task, idx) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 rounded-lg border bg-accent/5">
                        <Checkbox 
                          id={`task-${idx}`} 
                          checked={selectedItems.includes(task)}
                          onCheckedChange={() => toggleItem(task)}
                        />
                        <label htmlFor={`task-${idx}`} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                          {task}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Action Items</h4>
                  <div className="space-y-2">
                    {suggestions.actionItems.map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 rounded-lg border">
                        <Checkbox 
                          id={`item-${idx}`} 
                          checked={selectedItems.includes(item)}
                          onCheckedChange={() => toggleItem(item)}
                        />
                        <label htmlFor={`item-${idx}`} className="text-sm leading-none cursor-pointer">
                          {item}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
              <p className="text-xs text-muted-foreground">
                {selectedItems.length} items selected
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setSuggestions(null)}>Back</Button>
                <Button onClick={handleAddTasks} disabled={selectedItems.length === 0} className="bg-accent hover:bg-accent/90">
                  Add Selected Tasks
                </Button>
              </div>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}