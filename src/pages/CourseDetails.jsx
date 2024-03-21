import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { buyCourse } from '../services/operations/studentFeaturesAPI';
import {fetchCourseDetails} from '../services/operations/courseDetailsAPI';
import GetAvgRating from '../utils/avgRating';
import Error from './Error';
import ConfirmationModal from '../components/common/ConfirmationModal';
import RatingStars from '../components/common/RatingStars';
import {formatDate} from '../services/formatDate'
import CourseDetailsCard from '../components/core/Course/CourseDetailsCard';

const CourseDetails = () => {

    const {user} = useSelector((state)=>state.profile);
    const {token} = useSelector((state)=>state.auth);
    const {loading}=useSelector((state)=>state.auth);
    const {profileLoading}=useSelector((state)=>state.profile);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {courseId}  = useParams();
    const [courseData,setCourseData]=useState(null);
    const [confirmationModal,setConfirmationModal]=useState(null);

    useEffect(()=>{
        const getCourseDetails=async()=>{
            try{
                //fetch the course Details;
                const course=await fetchCourseDetails(courseId);
                if(!course?.data?.success){
                    console.log("Course Details is not fetched")
                }
                setCourseData(course);
                console.log("courseDetails...",course);
            }catch(error){
                console.log(error);
            }
        }
        getCourseDetails();
    },[courseId]);

    const [avgReviewCount,setAvgReviewCount]=useState(0);

    useEffect(()=>{
        const count=GetAvgRating(courseData?.data?.courseDetails?.ratingAndReviews);
        setAvgReviewCount(count);
        // console.log(avgReviewCount);
    },[courseData]);

    const [totalNoOfLectures,setTotalNoOfLectures]=useState(0);
    useEffect(()=>{
        let lectures=0;
        courseData?.data?.courseDetails?.courseContent?.forEach(element => {
            lectures+=element?.subSection.length || 0;
        });
        setTotalNoOfLectures(lectures);
  
    },[courseData]);

    if(loading || !courseData){
        return (
            <div>
                Loading....
            </div>
        )
    }
   

    if(!courseData.success){
        return (
            <div>
                <Error/>
            </div>
        )
    }

    

    const handleBuyCourse = () => {
        
        if(token) {
            buyCourse(token, [courseId], user, navigate, dispatch);
            return;
        }
        setConfirmationModal({
            text1:"yor are not Logged In",
            text2:"Please login to purchase the course",
            btn1Text:"Login",
            btn2Text:"Cancel",
            btn1Handler:()=>navigate("/login"),
            btn2Handler:()=>setConfirmationModal(null)
        });

    }

    const {
        _id:course_Id,
        courseName,
        courseDescription,
        thumbnail,
        price,
        whatYouWillLearn,
        courseContent,
        ratingAndReviews,
        instructor,
        studentsEnrolled,
        createdAt
    }=courseData?.data?.courseDetails;

    const [isActive,setIsActive]=useState(Array(0));

    const handleActive=(id)=>{
        setIsActive(
            !isActive.includes(id)?
            isActive.push(id):
            isActive.filter((e)=>e!=id)
        )
    }


  return (
    <div className='flex flex-col items-center text-white'>

        <div className='relative flex flex-col justify-start p-8'>
            <p>{courseName}</p>
            <p>{courseDescription}</p>
            <div className='flex gap-x-2'>
                <span>{avgReviewCount}</span>
                <RatingStars Review_Count={avgReviewCount} Star_Size={24}/>
                <span>{`(${ratingAndReviews.length || 0} reviews)`}</span>
                <span>{`(${studentsEnrolled.length} students enrolled)`}</span>
            </div>

            <div>
                <p>Created By {`${instructor.firstName}`}</p>
            </div>

            <div>
                <p>
                    Created At {formatDate(createdAt)}
                </p>
                <p>
                    {" "} English
                </p>
            </div>

            <div>
                <CourseDetailsCard
                    course={courseData?.data?.courseDetails}
                    setConfirmationModal={setConfirmationModal}
                    handleBuyCourse={handleBuyCourse}
                />
            </div>

            <div>
                <p>What You will Learn</p>
                <div>
                    {whatYouWillLearn}
                </div>
            </div>

            <div>
                <div>
                    <p>Course Content</p>
                </div>
                
                <div className='flex gap-x-3 justify-between'>
                  <div>
                        <span>{courseContent.length} section(s)</span>
                        
                        <span>
                            {totalNoOfLectures} lecture(s) 
                        </span>
                        
                        <span>
                            {courseData?.data?.totalDuration} total length
                        </span>
                  </div> 
                  <div>
                    <button onClick={()=>setIsActive([])}>
                        Collapse all Sections
                    </button>
                  </div>
                </div>
            </div>

        </div>

        {confirmationModal && <ConfirmationModal modalData={confirmationModal}/>}
    </div>
  )
}

export default CourseDetails
