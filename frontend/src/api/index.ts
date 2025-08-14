import axios from "axios";

const API=axios.create({
    baseURL:import.meta.env.VITE_BACKEND_URL
});


API.interceptors.request.use(async (req)=>{
    const profile = localStorage.getItem("Profile");
    if (profile !== null) {
        const parsedProfile = JSON.parse(profile);
        if (parsedProfile && parsedProfile.token) {
            req.headers.Authorization = `Bearer ${parsedProfile.token}`;
        }
    }
    return req;
})

export const loginApi = async (authdata: { email: string; password: string; setupKey: string | null }) => {
    const { data } = await API.post("auth/login", authdata);
    return data;
  };
export const registerUser=(authdata:{name:string, password:string|null, permissions:string[]})=>API.post("auth/register-user",authdata);
// export const getallusers=()=> API.get("/user/getallusers");
// export const updateprofile=(updatedata)=>API.patch(`auth/change-password`,updatedata)


// export const postquestion=(questiondata)=>API.post("/questions/Ask",questiondata);
// export const getallquestions=()=>API.get("/questions/get");
// export const deletequestion=(id)=>API.delete(`/questions/delete/${id}`);
// export const votequestion=(id,value)=>API.patch(`/questions/vote/${id}`,{value});


// export const postanswer=(id,noofanswers,answerbody,useranswered)=>API.patch(`/answer/post/${id}`,{noofanswers,answerbody,useranswered});
// export const deleteanswer=(id,answerid,noofanswers)=>API.patch(`/answer/delete/${id}`,{answerid,noofanswers});

// export const getAllPost = ()=> API.get("/media/post");
// export const getPost = (id)=> API.get(`/media/post/${id}`);
// export const likePost = (id)=> API.patch(`media/post/${id}/like`)
// export const dislikePost = (id)=> API.patch(`media/post/${id}/unlike`)
// export const commentOnPost = (id, content)=> API.post(`media/post/${id}/comment`, content)
// export const createPost = (formData)=> API.post(`media/post`, formData, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   });
// export const sendFriendReq = (id) => API.post(`media/sendreq`, {fromId:id});
// export const acceptReq = (id) => API.post(`media/acceptreq`, {reqId:id});
// export const cancelReq = (id) => API.post(`media/cancelreq`, {reqId:id});
// export const unfriendReq = (id) => API.post(`media/unfriendreq`, {reqId:id});
// export const rejectReq = (id) => API.post(`media/rejectreq`, {reqId:id});

// export const sendOtpEmailVerification = (email) => API.post(`user/sendOtpEmail`, {userId:email});
// export const sendOtpSmsVerification = (phoneNumber) => API.post(`user/sendOtpSms`, {userId:phoneNumber});
// export const otpEmailVerification = (otp, userId) => API.post(`user/emailVerification`, {otp, userId});