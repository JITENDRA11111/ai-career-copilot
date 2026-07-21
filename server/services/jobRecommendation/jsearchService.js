import axios from "axios";

const RAPID_API_URL = "https://jsearch.p.rapidapi.com/search-v2";

const RAPID_API_HEADERS = {
  "X-RapidAPI-Key": process.env.RAPID_API_KEY,
  "X-RapidAPI-Host": process.env.RAPID_API_HOST,
};

/**
 * Normalize JSearch Job Object
 */
function normalizeJob(job) {
  return {
    jobId:
      job.job_id ||
      `${job.employer_name}-${job.job_title}-${job.job_city}`,

    title: job.job_title || "",

    company: job.employer_name || "",

    employerLogo: job.employer_logo || "",

    location: [
      job.job_city,
      job.job_state,
      job.job_country,
    ]
      .filter(Boolean)
      .join(", "),

    city: job.job_city || "",

    state: job.job_state || "",

    country: job.job_country || "",

    employmentType:
      job.job_employment_type || "",

    description:
      job.job_description || "",

    applyLink:
      job.job_apply_link || "",

    salary: {
      min: Number(job.job_min_salary || 0),
      max: Number(job.job_max_salary || 0),
      currency:
        job.job_salary_currency || "",
      period:
        job.job_salary_period || "",
    },

    raw: job,
  };
}

/**
 * Fetch Jobs From JSearch RapidAPI
 *
 * @param {string[]} skills
 * @returns {Promise<Array>}
 */
export async function fetchJobsFromJSearch(
  skills = []
) {
  if (!skills.length) {
    return [];
  }

  const query = skills.join(" OR ");

  try {
    const response = await axios.get(
      RAPID_API_URL,
      {
        headers: RAPID_API_HEADERS,

        params: {
    query,
    page: 1,
    num_pages: 2,
    country: "in",
    date_posted: "all",
},
      }
    );

    console.log("========== JSearch Response ==========");
console.dir(response.data, { depth: null });
console.log("======================================");
console.log(typeof response.data.data);
console.log(Array.isArray(response.data.data));

const jobs = response.data?.data?.jobs || response.data?.data;

if (!Array.isArray(jobs)) {
    console.log("Unexpected Response:", response.data);
    return [];
}

return jobs.map(normalizeJob);

  } catch (error) {

    console.error(
      "JSearch API Error:",
      error.response?.data ||
        error.message
    );

    return [];
  }
}