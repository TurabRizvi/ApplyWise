"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { getResume, updateResumeTitle, type ResumeDetail } from "@/lib/api";
import { EducationSection } from "@/components/candidate/resume-sections/education-section";
import { ExperienceSection } from "@/components/candidate/resume-sections/experience-section";
import { ProjectsSection } from "@/components/candidate/resume-sections/projects-section";
import { SkillsSection } from "@/components/candidate/resume-sections/skills-section";
import { CertificationsSection } from "@/components/candidate/resume-sections/certifications-section";
import { LanguagesSection } from "@/components/candidate/resume-sections/languages-section";
import { DownloadResumePdfButton } from "@/components/candidate/download-resume-pdf-button";

export default function ResumeBuilderPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { callAuthed, profile } = useAuth();

  const [resume, setResume] = React.useState<ResumeDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [titleDraft, setTitleDraft] = React.useState("");
  const [isSavingTitle, setIsSavingTitle] = React.useState(false);

  const loadResume = React.useCallback(async () => {
    try {
      const res = await callAuthed((token) => getResume(token, params.id));
      setResume(res.data);
    } catch {
      setError("Couldn't load this resume. It may not exist or may not belong to you.");
    } finally {
      setIsLoading(false);
    }
  }, [callAuthed, params.id]);

  React.useEffect(() => {
    loadResume();
  }, [loadResume]);

  const handleSaveTitle = async () => {
    if (!resume || !titleDraft.trim()) return;
    setIsSavingTitle(true);
    try {
      await callAuthed((token) => updateResumeTitle(token, resume.id, titleDraft.trim()));
      setResume({ ...resume, title: titleDraft.trim() });
      setIsEditingTitle(false);
    } finally {
      setIsSavingTitle(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/candidate/resumes")}>
          <ArrowLeft className="h-4 w-4" /> Back to My Resumes
        </Button>
        <Card>
          <CardContent className="py-10 text-center text-sm text-destructive">
            {error ?? "Resume not found."}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push("/candidate/resumes")}>
            <ArrowLeft className="h-4 w-4" /> Back to My Resumes
          </Button>
          <DownloadResumePdfButton resume={resume} profile={profile} />
        </div>

        <div className="mt-2 flex items-center gap-2">
          {isEditingTitle ? (
            <>
              <Input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                className="max-w-sm text-xl font-bold"
                autoFocus
              />
              <Button size="icon" onClick={handleSaveTitle} disabled={isSavingTitle}>
                {isSavingTitle ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              </Button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{resume.title}</h1>
              <button
                onClick={() => {
                  setTitleDraft(resume.title);
                  setIsEditingTitle(true);
                }}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
        <p className="text-muted-foreground">
          {resume.isUploaded ? "Uploaded resume" : "Built from scratch"} · Last updated{" "}
          {new Date(resume.updatedAt).toLocaleDateString()}
        </p>
      </div>

      {resume.isUploaded && resume.extractedText && (
        <Card>
          <CardContent className="p-5">
            <p className="mb-2 text-sm font-semibold text-foreground">Extracted Resume Text</p>
            <p className="text-sm text-muted-foreground">
              This is the text ApplyWise&apos;s AI reads for analysis and rewrites. You can still add structured
              sections below (they&apos;re independent of the uploaded file).
            </p>
            <div className="mt-3 max-h-40 overflow-y-auto rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
              {resume.extractedText}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="education">
        <TabsList className="flex-wrap">
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="languages">Languages</TabsTrigger>
        </TabsList>

        <TabsContent value="education">
          <EducationSection resumeId={resume.id} items={resume.education} onChange={loadResume} />
        </TabsContent>
        <TabsContent value="experience">
          <ExperienceSection resumeId={resume.id} items={resume.experience} onChange={loadResume} />
        </TabsContent>
        <TabsContent value="projects">
          <ProjectsSection resumeId={resume.id} items={resume.projects} onChange={loadResume} />
        </TabsContent>
        <TabsContent value="skills">
          <SkillsSection resumeId={resume.id} items={resume.skills} onChange={loadResume} />
        </TabsContent>
        <TabsContent value="certifications">
          <CertificationsSection resumeId={resume.id} items={resume.certifications} onChange={loadResume} />
        </TabsContent>
        <TabsContent value="languages">
          <LanguagesSection resumeId={resume.id} items={resume.languages} onChange={loadResume} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
