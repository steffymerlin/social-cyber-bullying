import "./blogs.scss";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, doc, getDocs, getDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";

const Blogs = () => {
  const { id } = useParams(); // if id exists, user is on detail page
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (id) {
          // fetch a single course based on ID
          const docRef = doc(db, "Courses", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setSelectedCourse({ id: docSnap.id, ...docSnap.data() });
          } else {
            console.log("No such document!");
          }
        } else {
          // fetch all courses
          const querySnapshot = await getDocs(collection(db, "Courses"));
          const coursesData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setCourses(coursesData);
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [id]);

  const handleCourseClick = (courseId) => {
    navigate(`/blogs/${courseId}`);
  };

  const handleBack = () => {
    navigate("/blogs");
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // If a specific course is selected
  if (id && selectedCourse) {
    return (
      <div className="blogDetailPage">
        <button onClick={handleBack} className="backButton">← Go Back</button>
        <div className="detailCard">
          <h1>{selectedCourse.topicTitle}</h1>
          <p className="createdOn">Created On: {new Date(selectedCourse.createdOn.seconds * 1000).toLocaleDateString()}</p>
          <p className="rating">⭐ {selectedCourse.rating} Rating</p>
          <div className="description">
            {selectedCourse.description}
          </div>
        </div>
      </div>
    );
  }

  // Otherwise show all courses
  return (
    <div className="blogsPage">
      <h1>All Blogs</h1>
      <div className="coursesGrid">
        {courses.map((course) => (
          <div
            className="courseCard"
            key={course.id}
            // onClick={() => handleCourseClick(course.id)}
          >
            <h2>{course.topicTitle}</h2>
            <p>{course.description.length > 80 ? course.description.slice(0, 80) + "..." : course.description}</p>
            <div className="cardInfo">
              <span>📅 {course.createdOn}</span>
              <span>⭐ {course.rating}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blogs;
