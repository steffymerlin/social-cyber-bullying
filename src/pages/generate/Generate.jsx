import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { AuthContext } from '../../context/authContext';
import './AddCourse.css';

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

const generationConfig = {
  temperature: 0.9,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

const GenerateTopicsAiModel = model.startChat({
  generationConfig,
  history: [
    {
      role: "user",
      parts: [{ text: "Learn Python ::As you are coaching teacher\n-Generate 7-10 Course titles\n-Output JSON format: {course_titles: []}\n-No additional text" }],
    },
    {
      role: "model",
      parts: [{ text: "```json\n{\"course_titles\":[\"Python Basics\",\"Data Structures\",\"OOP in Python\"]}\n```" }],
    },
  ],
});

const AddCourse = () => {
  const [userInput, setUserInput] = useState('');
  const [topics, setTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedCourses, setGeneratedCourses] = useState([]);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const onGenerateTopic = async () => {
    if (!userInput.trim()) {
      setError('Please enter a topic');
      return;
    }
    setLoading(true);
    setError(null);
    setTopics([]);
    setSelectedTopics([]);
    setGeneratedCourses([]);

    const PROMPT = `${userInput} ::As you are coaching teacher\n- Generate 7-10 practical Course titles (max 3 words each)\n- Output format: { \"course_titles\": [\"title1\", \"title2\"] }\n- Only return JSON, no extra text`;

    try {
      const aiRes = await GenerateTopicsAiModel.sendMessage(PROMPT);
      const responseText = aiRes.response.text();
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : responseText;
      const topicIdea = JSON.parse(jsonString);
      setTopics(topicIdea.course_titles || []);
    } catch (err) {
      console.error('Error generating topics:', err);
      setError('Failed to generate topics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onGenerateCourse = async () => {
    if (selectedTopics.length === 0) {
      setError('Please select at least one topic');
      return;
    }

    setLoading(true);
    setError(null);

    const PROMPT = `You are an expert course creator. Create a detailed JSON structure for these topics: ${selectedTopics.join(', ')}. Each topic must include: topicTitle, description, detailedContent, examples, references, importantQuestions. Format strictly like: { \"courses\": [{ \"topicTitle\": \"\", \"description\": \"\", \"detailedContent\": \"\", \"examples\": \"\", \"references\": \"\", \"importantQuestions\": \"\" }] } Only JSON output. No extra text.`;

    try {
      const newCourseModel = model.startChat({ generationConfig, history: [] });
      const aiRes = await newCourseModel.sendMessage(PROMPT);
      const responseText = aiRes.response.text();
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : responseText;
      const { courses } = JSON.parse(jsonString);

      const generated = [];
      const savePromises = courses.map(async (course, index) => {
        const courseId = `${Date.now()}-${index}`;
        const courseData = {
          ...course,
          createdOn: new Date().toISOString(),
          createdBy: currentUser.email,
          userId: currentUser.uid,
          enrolledStudents: 0,
          rating: 0,
          reviews: []
        };
        generated.push(courseData);
        await setDoc(doc(db, 'Courses', courseId), courseData);
      });

      await Promise.all(savePromises);
      setGeneratedCourses(generated);
    } catch (err) {
      console.error('Error generating course:', err);
      setError('Failed to generate courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTopicSelection = (topic) => {
    setSelectedTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]);
  };

  return (
    <div className="add-course-container">
      <div className="add-course-card">
        <h1 className="add-course-title">AI Content Generator</h1>

        <div className="input-group">
          <label htmlFor="courseTopic" className="input-label">What do you want to learn?</label>
          <input
            id="courseTopic"
            type="text"
            className="input-field"
            placeholder="e.g., Python Programming, Web Development"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onGenerateTopic()}
          />
          <button
            className="generate-btn"
            onClick={onGenerateTopic}
            disabled={loading}
          >
            {loading ? <span className="loading-spinner"></span> : 'Generate Course Ideas'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {topics.length > 0 && (
          <div className="topics-section">
            <h2 className="section-subtitle">Select Topics for Your Course</h2>
            <div className="topics-grid">
              {topics.map((topic, index) => (
                <div
                  key={index}
                  className={`topic-card ${selectedTopics.includes(topic) ? 'selected' : ''}`}
                  onClick={() => toggleTopicSelection(topic)}
                >
                  {topic}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTopics.length > 0 && (
          <button
            className="generate-btn create-course-btn"
            onClick={onGenerateCourse}
            disabled={loading}
          >
            {loading ? <span className="loading-spinner"></span> : `Create ${selectedTopics.length} Course${selectedTopics.length > 1 ? 's' : ''}`}
          </button>
        )}
      </div>

      {generatedCourses.length > 0 && (
        <div className="generated-courses-section">
          <h2 className="section-subtitle">Generated Courses</h2>
          {generatedCourses.map((course, index) => (
            <div key={index} className="course-card">
              <h3 className="course-title">{course.topicTitle}</h3>

              <div className="course-details-section">
                <div className="details-label">Description:</div>
                <div className="details-value">{course.description}</div>

                <div className="details-label">Detailed Content:</div>
                <div className="details-value">{course.detailedContent}</div>

                <div className="details-label">Examples:</div>
                <div className="details-value">{course.examples}</div>

                <div className="details-label">Important Questions:</div>
                <div className="details-value">{course.importantQuestions}</div>

                <div className="details-label">References:</div>
                <div className="details-value">
                  <a href={course.references} target="_blank" rel="noopener noreferrer">{course.references}</a>
                </div>
              </div>
              <div className="course-meta">
                <span><strong>Created By:</strong> {course.createdBy}</span>
                <span><strong>Created On:</strong> {new Date(course.createdOn).toLocaleString()}</span>
                <span><strong>Rating:</strong> {course.rating}</span>
                <span><strong>Enrolled Students:</strong> {course.enrolledStudents}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddCourse;
