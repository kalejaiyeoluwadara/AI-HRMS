"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { Bot, Send, Loader2 } from "lucide-react"
import { employeeApi, payrollApi } from "@/lib/api"
import { toast } from "sonner"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I am your HR AI Assistant. I can help you with questions about employees, payroll, policies, and more. How can I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await generateAIResponse(input.trim())
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      toast.error("Failed to get AI response")
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const generateAIResponse = async (query: string): Promise<string> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const lowerQuery = query.toLowerCase()

    // Employee-related queries
    if (lowerQuery.includes("employee") || lowerQuery.includes("staff") || lowerQuery.includes("worker")) {
      const employeesRes = await employeeApi.getAll()
      if (employeesRes.success && employeesRes.data) {
        const totalEmployees = employeesRes.data.length
        const activeEmployees = employeesRes.data.filter((e) => e.employmentStatus === "active").length

        if (lowerQuery.includes("how many") || lowerQuery.includes("count") || lowerQuery.includes("total")) {
          return `We currently have ${totalEmployees} employees in the system, with ${activeEmployees} active employees.`
        }

        if (lowerQuery.includes("list") || lowerQuery.includes("show") || lowerQuery.includes("all")) {
          const employeeList = employeesRes.data
            .slice(0, 5)
            .map((e) => `${e.name} (${e.email})`)
            .join(", ")
          return `Here are some employees: ${employeeList}${totalEmployees > 5 ? ` and ${totalEmployees - 5} more.` : ""}. You can view all employees in the Employees section.`
        }

        if (lowerQuery.includes("department") || lowerQuery.includes("dept")) {
          const jobRoles = [...new Set(employeesRes.data.map((e) => e.jobRole))]
          return `Our employees work in the following roles: ${jobRoles.join(", ")}.`
        }
      }
      return "I can help you with employee information. You can ask about total employees, employee lists, departments, or specific employee details."
    }

    // Payroll-related queries
    if (lowerQuery.includes("payroll") || lowerQuery.includes("salary") || lowerQuery.includes("pay")) {
      const payrollRes = await payrollApi.getAll()
      if (payrollRes.success && payrollRes.data) {
        const pendingPayroll = payrollRes.data.filter((p) => p.status === "pending").length
        const totalPayroll = payrollRes.data.length

        if (lowerQuery.includes("pending") || lowerQuery.includes("approve")) {
          return `There are currently ${pendingPayroll} payroll runs pending approval. You can review and approve them in the Payroll section.`
        }

        if (lowerQuery.includes("how many") || lowerQuery.includes("total")) {
          return `We have processed ${totalPayroll} payroll runs in total. ${pendingPayroll > 0 ? `There are ${pendingPayroll} pending approval.` : "All payroll runs have been processed."}`
        }
      }
      return "I can help you with payroll information. You can ask about pending payroll, payroll history, or payroll processes."
    }

    // Policy and general HR queries
    if (lowerQuery.includes("policy") || lowerQuery.includes("policies") || lowerQuery.includes("rule")) {
      return "Our HR policies cover areas such as leave management, attendance, code of conduct, and performance reviews. For specific policy details, please refer to the HR handbook or contact the HR department directly."
    }

    if (lowerQuery.includes("leave") || lowerQuery.includes("vacation") || lowerQuery.includes("time off")) {
      return "Leave requests are managed through the HRMS system. Employees can submit leave requests, which are then reviewed and approved by their supervisors. Standard leave types include annual leave, sick leave, and personal leave."
    }

    if (lowerQuery.includes("attendance") || lowerQuery.includes("present") || lowerQuery.includes("absent")) {
      return "Attendance is tracked through our HRMS system. You can view attendance records, track employee presence, and generate attendance reports through the dashboard."
    }

    // Greetings
    if (lowerQuery.includes("hello") || lowerQuery.includes("hi") || lowerQuery.includes("hey")) {
      return "Hello! I am here to help you with HR-related questions. You can ask me about employees, payroll, policies, leave management, or any other HR topics."
    }

    // Help queries
    if (lowerQuery.includes("help") || lowerQuery.includes("what can you do") || lowerQuery.includes("capabilities")) {
      return "I can help you with:\n- Employee information (counts, lists, departments)\n- Payroll information (pending approvals, history)\n- HR policies and procedures\n- Leave management\n- Attendance tracking\n- General HR questions\n\nJust ask me anything related to HR management!"
    }

    // Default response
    return "I understand you are asking about: \"" + query + "\". I can help you with employee information, payroll details, HR policies, leave management, and attendance. Could you please rephrase your question or be more specific?"
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="h-8 w-8" />
            AI HR Assistant
          </h1>
          <p className="text-muted-foreground mt-2">
            Ask me anything about employees, payroll, policies, and HR management
          </p>
        </div>

        <Card className="border-none shadow-sm h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle>Chat</CardTitle>
            <CardDescription>Your AI-powered HR assistant</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-xs text-primary-foreground font-medium">U</span>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Ask me anything about HR..."
                disabled={loading}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={loading || !input.trim()}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
