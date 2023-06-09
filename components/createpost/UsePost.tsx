"use client";
import { auth, db } from "@/utils/firebase";
import { postsData } from "@/utils/getdata";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast, ToastContainer } from "react-toastify";

const UsePost = ({ loggedInUser }: LoggedInUser) => {
  const [user, loading] = useAuthState(auth);
  const [selectedPost, setSelectedPost] = useState<string>();
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("Daily");
  const [selectedUploadTimeframe, setSelectedUploadTimeframe] =
    useState<string>("Weekly");
  const [usersPosts, setUsersPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  // * Update the users timeframe cooldown based on what they select
  const updateUserInfo = async (userId: string) => {
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      if (!docSnap) return;
      const docData = docSnap.data();
      if (!docData) return;
      let updatedData;
      if (selectedUploadTimeframe === "Daily") {
        updatedData = { ...docData, dailyPosted: true };
      } else if (selectedUploadTimeframe === "Weekly") {
        updatedData = { ...docData, weeklyPosted: true };
      } else if (selectedUploadTimeframe === "Monthly") {
        updatedData = { ...docData, monthlyPosted: true };
      } else if (selectedUploadTimeframe === "Yearly") {
        updatedData = { ...docData, yearlyPosted: true };
      }
      await updateDoc(docRef, updatedData);
    } catch (error) {
      console.log(error);
    }
  };

  // * Update state for timeframe
  const updatePostTimeframe = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    try {
      if (!selectedPost) return;
      const docRef = doc(db, "posts", selectedPost);
      const docSnap = await getDoc(docRef);
      if (!docSnap) return;
      const docData = docSnap.data();
      if (!docData) return;
      const updatedData = { ...docData, timeframe: selectedUploadTimeframe };
      await updateDoc(docRef, updatedData);
      toast.success("Post successfully updated! ✅");
      updateUserInfo(docData.userId);
    } catch (err) {
      console.log(err);
      toast.error("Post not successful, please try again.");
    }
  };

  useEffect(() => {
    // * Get the posts data from database
    if (user) {
      postsData(
        "posts",
        "googleId",
        "==",
        user?.uid,
        setUsersPosts,
        setFilteredPosts
      );
    }
  }, [loggedInUser, user]);

  useEffect(() => {
    // * Change the filter of the timeframe on data and set state
    const filteredTimeframe = async () => {
      if (usersPosts.length > 0) {
        const filteredList = usersPosts.filter((post) => {
          return post.timeframe === selectedTimeframe;
        });

        setFilteredPosts([...filteredList]);
      }
    };
    filteredTimeframe();
  }, [selectedTimeframe, usersPosts]);

  return (
    <div className="shadow-xl rounded-lg flex flex-col gap-2 p-2">
      <ToastContainer limit={1} />
      <h1 className="font-bold text-teal-500 text-xl">Use Created Highlight</h1>
      <p>Use an already made highlight for a new timeframe.</p>
      {loggedInUser && (
        <form className="flex flex-col gap-2">
          <h1 className="font-bold text-teal-500">Timeframe:</h1>
          <select
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="w-full"
            value={selectedTimeframe}
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
          <h1 className="font-bold text-teal-500">Select Post:</h1>
          <select
            onChange={(e) => setSelectedPost(e.target.value)}
            className="w-full"
            value={selectedPost}
          >
            <option>Choose an already made post</option>
            {filteredPosts?.map((post) => (
              <option key={post.id} value={post.id}>
                {post.title}
              </option>
            ))}
          </select>
          <h1 className="font-bold text-teal-500">
            Select Timeframe To Upload To:
          </h1>
          <select
            value={selectedUploadTimeframe}
            onChange={(e) => setSelectedUploadTimeframe(e.target.value)}
            className="w-full"
          >
            {selectedTimeframe != "Monthly" && (
              <option
                value="Weekly"
                disabled={loggedInUser?.weeklyPosted === true}
              >
                Weekly
              </option>
            )}
            <option
              value="Monthly"
              disabled={loggedInUser?.monthlyPosted === true}
            >
              Monthly
            </option>
            <option
              value="Yearly"
              disabled={loggedInUser?.yearlyPosted === true}
            >
              Yearly
            </option>
          </select>
          <button
            onClick={(e) => updatePostTimeframe(e)}
            className="bg-teal-500 py-2 px-4 rounded-xl text-white hover:bg-teal-600"
          >
            Select
          </button>
        </form>
      )}
    </div>
  );
};

export default UsePost;
