export const defaultResume = {
  name: "",
  email: "",
  phone: "",
  summary: "",

  skills: [],

  projects: [],

  experience: [],

  education: [],

  certifications: [],

  languages: [],

  links: {
    github: "",
    linkedin: "",
    portfolio: "",
  },

  ats: {
    score: 0,
    strengths: [],
    weaknesses: [],
    missingSkills: [],
    recommendedRoles: [],
    keywords: [],
  },
};

export const validateResume = (data) => {
  if (!data || typeof data !== "object") {
    return structuredClone(defaultResume);
  }

  return {
    ...structuredClone(defaultResume),

    ...data,

    skills: Array.isArray(data.skills) ? [...new Set(data.skills)] : [],

    projects: Array.isArray(data.projects) ? data.projects : [],

    experience: Array.isArray(data.experience)
      ? data.experience
      : [],

    education: Array.isArray(data.education)
      ? data.education
      : [],

    certifications: Array.isArray(data.certifications)
      ? data.certifications
      : [],

    languages: Array.isArray(data.languages)
      ? data.languages
      : [],

    links: {
      ...defaultResume.links,
      ...(data.links || {}),
    },

    ats: {
      ...defaultResume.ats,
      ...(data.ats || {}),
    },
  };
};