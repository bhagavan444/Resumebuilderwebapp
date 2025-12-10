const handleUpload = async () => {
  if (!file) {
    alert("Please upload a resume file.");
    return;
  }

  if (hasUploaded) {
    alert("You can upload only once. Please refresh the page to upload again.");
    return;
  }

  setLoading(true);
  setError("");

  try {
    const data = await scoreResumeFile(file);

    if (data && typeof data.score === "number") {
      setScore(data.score);
      setHasUploaded(true); // ✅ Prevent further uploads
    } else {
      console.warn("⚠️ No score returned from backend:", data);
      setError("Score not returned from server.");
    }
  } catch (err) {
    console.error("❌ Error uploading resume:", err);
    if (err.message.includes("No resume uploaded")) {
      setError("No resume uploaded. Please select a valid PDF file.");
    } else {
      setError("Failed to analyze resume. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};
