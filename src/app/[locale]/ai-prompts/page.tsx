"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  RotateCcw,
  Sparkles,
  Code,
  Video,
  Copy,
  Check,
  History,
  Variable,
  Play,
  Trash2,
  Plus,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptVariable {
  name: string;
  description: string;
  example: string;
}

interface SystemPrompt {
  id: string;
  name: string;
  description: string;
  content: string;
  icon: React.ElementType;
  category: string;
  isActive: boolean;
  lastModified: string;
  modifiedBy: string;
  variables: PromptVariable[];
}

const mockPrompts: SystemPrompt[] = [
  {
    id: "code-evaluation",
    name: "Code Evaluation",
    description: "Used to evaluate and grade user code submissions with detailed feedback",
    icon: Code,
    category: "evaluation",
    isActive: true,
    lastModified: "2026-02-20T10:30:00Z",
    modifiedBy: "Admin",
    content: `You are an expert code reviewer evaluating a programming solution.

## Task
Evaluate the following code submission for the problem: {{problemTitle}}

## Code to Evaluate
\`\`\`{{language}}
{{code}}
\`\`\`

## Evaluation Criteria
1. **Correctness**: Does the code solve the problem correctly?
2. **Efficiency**: What is the time and space complexity?
3. **Code Quality**: Is the code clean, readable, and well-structured?
4. **Edge Cases**: Does it handle edge cases properly?

## Response Format
Provide your evaluation in the following JSON structure:
\`\`\`json
{
  "score": <0-100>,
  "correctness": "<explanation>",
  "efficiency": "<analysis>",
  "codeQuality": "<feedback>",
  "suggestions": ["<improvement 1>", "<improvement 2>"],
  "overallFeedback": "<summary>"
}
\`\`\``,
    variables: [
      { name: "problemTitle", description: "Title of the problem", example: "Two Sum" },
      { name: "language", description: "Programming language", example: "python" },
      { name: "code", description: "User's submitted code", example: "def solution(nums, target):..." },
    ],
  },
  {
    id: "live-interview",
    name: "Live Interview",
    description: "Conducts technical interviews with adaptive questioning and real-time assistance",
    icon: Video,
    category: "interview",
    isActive: true,
    lastModified: "2026-02-18T14:15:00Z",
    modifiedBy: "Admin",
    content: `You are a technical interviewer conducting a live coding interview.

## Candidate Information
- **Name**: {{candidateName}}
- **Position**: {{position}}
- **Experience Level**: {{experienceLevel}}

## Interview Context
- **Problem**: {{problemTitle}}
- **Difficulty**: {{difficulty}}
- **Time Remaining**: {{timeRemaining}} minutes

## Your Role
1. Guide the candidate through the problem-solving process
2. Ask clarifying questions when needed
3. Provide hints if the candidate is stuck (but don't give away the solution)
4. Evaluate their thought process, communication, and coding skills
5. Keep track of time and provide warnings when appropriate

## Guidelines
- Be professional and encouraging
- Focus on problem-solving approach, not just the final answer
- Adapt your hints based on the candidate's progress
- Take notes on strengths and areas for improvement

## Current Code
\`\`\`{{language}}
{{currentCode}}
\`\`\`

## Response Instructions
Respond as the interviewer. Continue the conversation naturally while maintaining your role.`,
    variables: [
      { name: "candidateName", description: "Name of the interview candidate", example: "John Doe" },
      { name: "position", description: "Job position being interviewed for", example: "Senior Software Engineer" },
      { name: "experienceLevel", description: "Candidate's experience level", example: "Mid-level" },
      { name: "problemTitle", description: "Current problem title", example: "Binary Tree Level Order Traversal" },
      { name: "difficulty", description: "Problem difficulty", example: "Medium" },
      { name: "timeRemaining", description: "Minutes left in interview", example: "25" },
      { name: "language", description: "Programming language", example: "javascript" },
      { name: "currentCode", description: "Current code in editor", example: "function solution(root) {...}" },
    ],
  },
];

const mockVersionHistory = [
  { version: "v1.2", date: "2026-02-20T10:30:00Z", author: "Admin", changes: "Added efficiency analysis section" },
  { version: "v1.1", date: "2026-02-15T09:20:00Z", author: "Admin", changes: "Updated response format to JSON" },
  { version: "v1.0", date: "2026-02-10T14:00:00Z", author: "System", changes: "Initial prompt creation" },
];

export default function AiPromptsPage() {
  const t = useTranslations("AiPrompts");
  const [selectedPrompt, setSelectedPrompt] = useState<SystemPrompt | null>(null);
  const [prompts, setPrompts] = useState<SystemPrompt[]>(mockPrompts);
  const [editedContent, setEditedContent] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("editor");
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const filteredPrompts = prompts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectPrompt = (prompt: SystemPrompt) => {
    setSelectedPrompt(prompt);
    setEditedContent(prompt.content);
    setHasChanges(false);
    setActiveTab("editor");
  };

  const handleBackToList = () => {
    if (hasChanges) {
      const confirmed = window.confirm(t("unsavedChanges"));
      if (!confirmed) return;
    }
    setSelectedPrompt(null);
    setEditedContent("");
    setHasChanges(false);
  };

  const handleContentChange = (value: string) => {
    setEditedContent(value);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!selectedPrompt) return;

    setPrompts((prev) =>
      prev.map((p) =>
        p.id === selectedPrompt.id
          ? {
              ...p,
              content: editedContent,
              lastModified: new Date().toISOString(),
              modifiedBy: "Admin",
            }
          : p
      )
    );
    setHasChanges(false);
    alert(t("saveSuccess"));
  };

  const handleReset = () => {
    if (selectedPrompt) {
      setEditedContent(selectedPrompt.content);
      setHasChanges(false);
    }
  };

  const copyVariable = (varName: string) => {
    navigator.clipboard.writeText(`{{${varName}}}`);
    setCopiedVar(varName);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  const insertVariable = (varName: string) => {
    const variable = `{{${varName}}}`;
    setEditedContent((prev) => prev + variable);
    setHasChanges(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (selectedPrompt) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={handleBackToList}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <selectedPrompt.icon className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold tracking-tight">{selectedPrompt.name}</h2>
                <Badge variant={selectedPrompt.isActive ? "default" : "secondary"}>
                  {selectedPrompt.isActive ? t("active") : t("inactive")}
                </Badge>
              </div>
              <p className="text-muted-foreground">{selectedPrompt.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {t("reset")}
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges} className="gap-2">
              <Save className="h-4 w-4" />
              {t("saveChanges")}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor Section */}
          <div className="lg:col-span-2 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="editor" className="gap-2">
                  <Code className="h-4 w-4" />
                  {t("editor")}
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-2">
                  <Play className="h-4 w-4" />
                  {t("testPreview")}
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2">
                  <History className="h-4 w-4" />
                  {t("versionHistory")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t("promptContent")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MarkdownEditor
                      value={editedContent}
                      onChange={handleContentChange}
                      placeholder={t("editorPlaceholder")}
                      minHeight="min-h-[500px]"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("testPreviewTitle")}</CardTitle>
                    <CardDescription>{t("testPreviewDescription")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {selectedPrompt.variables.map((variable) => (
                        <div key={variable.name} className="space-y-2">
                          <label className="text-sm font-medium">
                            {variable.name}
                            <span className="text-muted-foreground ml-2">
                              ({variable.description})
                            </span>
                          </label>
                          <Input
                            placeholder={variable.example}
                            className="font-mono text-sm"
                          />
                        </div>
                      ))}
                    </div>
                    <Button className="w-full gap-2">
                      <Play className="h-4 w-4" />
                      {t("runTest")}
                    </Button>
                    <Separator />
                    <div className="bg-muted rounded-lg p-4 min-h-[300px]">
                      <p className="text-sm text-muted-foreground">{t("previewOutput")}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("versionHistory")}</CardTitle>
                    <CardDescription>{t("versionHistoryDescription")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockVersionHistory.map((version, index) => (
                        <div
                          key={version.version}
                          className="flex items-start justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={index === 0 ? "default" : "secondary"}>
                                {version.version}
                              </Badge>
                              <span className="text-sm font-medium">
                                {version.changes}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {t("modifiedBy", { author: version.author, date: formatDate(version.date) })}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            {t("restore")}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Variables Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Variable className="h-5 w-5" />
                  {t("availableVariables")}
                </CardTitle>
                <CardDescription>{t("variablesDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedPrompt.variables.map((variable) => (
                    <div
                      key={variable.name}
                      className="group flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded">
                            {`{{${variable.name}}}`}
                          </code>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {variable.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyVariable(variable.name)}
                          title={t("copyVariable")}
                        >
                          {copiedVar === variable.name ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => insertVariable(variable.name)}
                          title={t("insertVariable")}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Info Panel */}
            <Card>
              <CardHeader>
                <CardTitle>{t("promptInfo")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("category")}</span>
                  <Badge variant="outline">{selectedPrompt.category}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("lastModified")}</span>
                  <span className="text-sm">{formatDate(selectedPrompt.lastModified)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("modifiedBy")}</span>
                  <span className="text-sm">{selectedPrompt.modifiedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("characterCount")}</span>
                  <span className="text-sm">{editedContent.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-blue-900 dark:text-blue-100">
                  <Sparkles className="h-4 w-4" />
                  {t("tips")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-2 list-disc list-inside">
                  <li>{t("tip1")}</li>
                  <li>{t("tip2")}</li>
                  <li>{t("tip3")}</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t("createPrompt")}
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("filterByCategory")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allCategories")}</SelectItem>
              <SelectItem value="evaluation">{t("categoryEvaluation")}</SelectItem>
              <SelectItem value="interview">{t("categoryInterview")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPrompts.map((prompt) => (
          <Card
            key={prompt.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
              "group"
            )}
            onClick={() => handleSelectPrompt(prompt)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <prompt.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{prompt.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {prompt.category}
                    </Badge>
                  </div>
                </div>
                <Badge variant={prompt.isActive ? "default" : "secondary"}>
                  {prompt.isActive ? t("active") : t("inactive")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {prompt.description}
              </p>
              <Separator />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {t("variablesCount", { count: prompt.variables.length })}
                </span>
                <span>{t("lastModified")}: {formatDate(prompt.lastModified)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPrompts.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">{t("noPromptsFound")}</h3>
          <p className="text-muted-foreground">{t("tryAdjustingSearch")}</p>
        </div>
      )}
    </div>
  );
}
