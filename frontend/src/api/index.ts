import axios from "axios";
import type { Permission, Role } from "./types";

export const API=axios.create({
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

const getCreatedBy = () => {
  return JSON.parse(localStorage.getItem("auth-store") || "{}")?.state?.user?.email || null;
};


export const loginApi = async (authdata: { email: string; password: string; setupKey: string | null }) => {
    const { data } = await API.post("auth/login", authdata);
    return data;
  };
export const registerUser= async (authdata:{name:string, email:string, phone:string|null, password:string|null, roles:Role[]})=>  {
    const {data} = await API.post("auth/register-user",authdata)
    return data;
}
export const changePassword= async (authdata:{email:string, oldPassword:string, newPassword:string})=>  {
    const {data} = await API.post("auth/change-password",authdata)
    return data;
}
export const checkUserExists = async (email: string) => {
    const { data } = await API.get(`auth/exists?email=${email}`);
    return data.success; // true | false
  };
  
// OTP
export const sendOTP = async (authdata:{email:string}) =>{
    const {data} = await API.post("auth/send-otp", authdata);
    return data;
}
export const verifyOTP = async (authdata:{email:string, otp:string}) =>{
    const {data} = await API.post("auth/verify-otp", authdata);
    return data;
}


// Schoool
export const createSchool = async (authdata: {
    schoolName: string,
    logo: File | null,
    address: string,
    director: { name?: string, email: string },
    principal: { name?: string, email: string },
    currentSession: string
  }) => {
  
    const email = JSON.parse(localStorage.getItem("auth-store") || "{}")?.state?.user?.email;
    if (!email) {
      return { success: false, message: "Please Log in and Try again" };
    }
  
    // Build FormData for file + text fields
    const formData = new FormData();
    formData.append("schoolName", authdata.schoolName);
    formData.append("address", authdata.address);
    formData.append("currentSession", authdata.currentSession);
    if(authdata.logo) formData.append("logo", authdata.logo);
    formData.append("director", JSON.stringify(authdata.director));
    formData.append("principal", JSON.stringify(authdata.principal));
    formData.append("createdBy", email);
    formData.append("task", "CREATE_SCHOOL");

    // Send as multipart/form-data
    const { data } = await API.post("/school/create-school", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  
    return data;
  };
  export const createStudentApi = async (studentData: any) => {
    console.log("student data ", studentData);
    const email = getCreatedBy();
    const branchId = JSON.parse(localStorage.getItem("auth-store") as  string).state.user.branchId;
    const payload = {
      ...studentData,
      createdBy: email,
      task: "CREATE_STUDENT",
      branchId
    };
  
    const { data } = await API.post("/student/create-student", payload);
    return data;
  };
  // Bulk upload students (with file)
export const bulkUploadStudents = async (formData: FormData) => {
  const email = getCreatedBy();

  formData.append("createdBy", email);
  formData.append("task", "BULK_UPLOAD_STUDENTS");

  const { data } = await API.post("/student/bulk-upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
};

// Fetch students
export const fetchStudents = async (filters: Record<string, any> = {}) => {
  const email = getCreatedBy();

  const params = {
    ...filters,
    createdBy: email,
    task: "FETCH_STUDENTS",
  };

  const { data } = await API.get("/student/fetch", { params });
  return data;
};



// Permission
export const assignPermission = async(authdata:{permissionToWhomId:string, permissionsToAllow:Permission[], permissionsToDeny:Permission[]})=>{
    const {data} = await API.post("/auth/assign-permission", authdata);
    return data;
}

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