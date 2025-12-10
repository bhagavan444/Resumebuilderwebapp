const BASE_URL = "http://localhost:5000/api";

// ✅ Upload resume for ATS scoring
export const scoreResumeFile = async (file) => {
  const formData = new FormData();
  formData.append("resume", file);

  try {
    const response = await fetch(`${BASE_URL}/score`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error from /api/score:", errorText);
      throw new Error("Failed to get resume score");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Exception in scoreResumeFile:", error);
    throw error;
  }
};

// ✅ Save resume form data to MongoDB
export const createResume = async (formData) => {
  try {
    const response = await fetch(`${BASE_URL}/resumes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error from /api/resumes:", errorText);
      throw new Error("Failed to create resume");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Exception in createResume:", error);
    throw error;
  }
};

// ✅ Get the latest saved resume
export const getLatestResume = async () => {
  try {
    const response = await fetch(`${BASE_URL}/resumes/latest`);
    if (!response.ok) {
      throw new Error("Failed to fetch latest resume");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Error fetching latest resume:", error);
    throw error;
  }
};

// ✅ Optional: Get all saved resumes
export const getAllResumes = async () => {
  try {
    const response = await fetch(`${BASE_URL}/resumes`);
    if (!response.ok) {
      throw new Error("Failed to fetch all resumes");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Error fetching all resumes:", error);
    throw error;
  }
};
