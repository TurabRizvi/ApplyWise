import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";
import type { ResumeDetail, Profile } from "@/lib/api";

// Uses react-pdf's built-in Helvetica (no external font loading needed —
// keeps this working offline/without any network dependency, unlike a
// Google Font would require).
const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a1a" },
  name: { fontSize: 20, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  contactRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16, color: "#555" },
  contactItem: { fontSize: 9 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginTop: 14,
    marginBottom: 6,
    borderBottom: "1pt solid #ccc",
    paddingBottom: 3,
  },
  entry: { marginBottom: 8 },
  entryTitleRow: { flexDirection: "row", justifyContent: "space-between" },
  entryTitle: { fontSize: 10.5, fontFamily: "Helvetica-Bold" },
  entrySubtitle: { fontSize: 9.5, color: "#444", marginTop: 1 },
  entryDate: { fontSize: 9, color: "#666" },
  entryDescription: { fontSize: 9.5, marginTop: 3, lineHeight: 1.4 },
  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  skillChip: { fontSize: 9, backgroundColor: "#f0f0f0", paddingVertical: 2, paddingHorizontal: 6, borderRadius: 3 },
});

function formatDate(iso: string | null | undefined) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function ResumePdfDocument({ resume, profile }: { resume: ResumeDetail; profile: Profile | null }) {
  const contactItems = [
    profile?.location,
    profile?.phone,
    profile?.linkedinUrl,
    profile?.githubUrl,
    profile?.portfolioUrl,
  ].filter(Boolean) as string[];

  return (
    <Document title={profile?.fullName ? `${profile.fullName} - Resume` : resume.title}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{profile?.fullName ?? resume.title}</Text>
        {contactItems.length > 0 && (
          <View style={styles.contactRow}>
            {contactItems.map((item, i) => (
              <Text key={i} style={styles.contactItem}>
                {item}
                {i < contactItems.length - 1 ? "  •" : ""}
              </Text>
            ))}
          </View>
        )}
        {profile?.bio && <Text style={styles.entryDescription}>{profile.bio}</Text>}

        {resume.experience.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Experience</Text>
            {resume.experience.map((exp) => (
              <View key={exp.id} style={styles.entry}>
                <View style={styles.entryTitleRow}>
                  <Text style={styles.entryTitle}>{exp.role}</Text>
                  <Text style={styles.entryDate}>
                    {formatDate(exp.startDate)} — {exp.isCurrent ? "Present" : formatDate(exp.endDate)}
                  </Text>
                </View>
                <Text style={styles.entrySubtitle}>{exp.company}</Text>
                {exp.description && <Text style={styles.entryDescription}>{exp.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {resume.education.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {resume.education.map((edu) => (
              <View key={edu.id} style={styles.entry}>
                <View style={styles.entryTitleRow}>
                  <Text style={styles.entryTitle}>{edu.degree}</Text>
                  <Text style={styles.entryDate}>
                    {formatDate(edu.startDate)} — {formatDate(edu.endDate)}
                  </Text>
                </View>
                <Text style={styles.entrySubtitle}>
                  {edu.institution}
                  {edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ""}
                </Text>
                {edu.description && <Text style={styles.entryDescription}>{edu.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {resume.projects.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Projects</Text>
            {resume.projects.map((proj) => (
              <View key={proj.id} style={styles.entry}>
                <Text style={styles.entryTitle}>{proj.name}</Text>
                {proj.techStack && <Text style={styles.entrySubtitle}>{proj.techStack}</Text>}
                {proj.description && <Text style={styles.entryDescription}>{proj.description}</Text>}
                {proj.projectUrl && (
                  <Link src={proj.projectUrl} style={{ fontSize: 9, color: "#2563eb" }}>
                    {proj.projectUrl}
                  </Link>
                )}
              </View>
            ))}
          </View>
        )}

        {resume.skills.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsRow}>
              {resume.skills.map((skill) => (
                <Text key={skill.id} style={styles.skillChip}>
                  {skill.name}
                </Text>
              ))}
            </View>
          </View>
        )}

        {resume.certifications.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {resume.certifications.map((cert) => (
              <View key={cert.id} style={styles.entry}>
                <Text style={styles.entryTitle}>{cert.name}</Text>
                {cert.issuer && <Text style={styles.entrySubtitle}>{cert.issuer}</Text>}
              </View>
            ))}
          </View>
        )}

        {resume.languages.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Languages</Text>
            <View style={styles.skillsRow}>
              {resume.languages.map((lang) => (
                <Text key={lang.id} style={styles.skillChip}>
                  {lang.name}
                  {lang.proficiency ? ` (${lang.proficiency})` : ""}
                </Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}
