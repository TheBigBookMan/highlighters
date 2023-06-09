"use client";
import { auth, db } from "@/utils/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { FiThumbsUp } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { commentFilter } from "@/utils/filterposts";
import { ImBin } from "react-icons/im";
import { updateLoggedInUser } from "@/utils/loggedinuser";
import { likeButton, postsData, unlikeButton } from "@/utils/getdata";

const Comments = ({ params }: Params) => {
  const [user, loading] = useAuthState(auth);
  const selectedPostId = params?.post;
  const [comments, setComments] = useState<Comment[]>([]);
  const [writeComment, setWriteComment] = useState<string>("");
  const [loggedInUser, setLoggedInUser] = useState<User>();
  const [selectedFilter, setSelectedFilter] = useState<string>("Most Recent");

  // * Update post document with comment
  const updatePostDoc = async (commentId: string) => {
    try {
      if (!selectedPostId) return;
      const docRef = doc(db, "posts", selectedPostId);
      const docSnap = await getDoc(docRef);
      if (docSnap) {
        const docData = docSnap.data();
        const updatedComments = [...docData?.comments, commentId];
        const updatedData = { ...docData, comments: [...updatedComments] };
        await updateDoc(docRef, updatedData);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // * Create a comment with form details
  const createComment = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (writeComment === "") {
      toast.error("Need to input a comment.❌");
      return;
    }
    try {
      let today: Date | string = new Date();
      today = today.toLocaleDateString();
      const collectionRef = collection(db, "comments");
      const newComment = await addDoc(collectionRef, {
        comment: writeComment,
        postId: selectedPostId,
        userName: user?.displayName,
        userImage: user?.photoURL,
        date: today,
        userId: loggedInUser?.id,
        createdAt: serverTimestamp(),
        likedByUsers: [],
      });
      toast.success("Post successful!✅");
      updatePostDoc(newComment.id);
      setWriteComment("");
    } catch (err) {
      console.log(err);
    }
  };

  // * Delete the comment
  const deleteComment = async (
    e: React.MouseEvent<HTMLButtonElement>,
    commentId: any
  ) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "comments", commentId.id);
      await deleteDoc(docRef);
      toast.success("Successfully deleted comment ✅");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    // * Change state based on selected filter for comments
    const filterSelection = async () => {
      const returnedList = await commentFilter(comments, selectedFilter);
      setComments([...returnedList]);
    };
    filterSelection();
  }, [selectedFilter]);

  useEffect(() => {
    // * Set logged in user state
    if (user) {
      updateLoggedInUser(setLoggedInUser, user?.uid);
    }

    // * Get the list of comments for a post from database
    if (selectedPostId) {
      postsData("comments", "postId", "==", selectedPostId, setComments, null);
    }
  }, [user, selectedPostId]);

  return (
    <div className="shadow-xl rounded-lg max-w-[640px] max-h-[540px] p-2 flex flex-col gap-2">
      <ToastContainer limit={1} />
      <div className="flex gap-2">
        <h1 className="font-bold text-teal-500 text-lg">Comments</h1>
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="bg-gray-200 rounded-xl"
        >
          <option value="Most Recent">Most Recent</option>
          <option value="Least Recent">Least Recent</option>
          <option value="Top Rated">Top Rated</option>
          <option value="Least Rated">Least Rated</option>
        </select>
      </div>
      <form className="flex flex-col gap-2">
        <textarea
          onChange={(e) => setWriteComment(e.target.value)}
          value={writeComment}
          className="bg-gray-100 border-2 rounded-lg p-1"
          cols={3}
          rows={3}
          placeholder="Add comment..."
        ></textarea>
        <button
          onClick={(e) => createComment(e)}
          className="bg-teal-500 w-[100px] py-2 px-4 rounded-xl text-white hover:bg-teal-600"
        >
          Add
        </button>
      </form>
      {comments.length === 0 ? (
        <h1>No comments...</h1>
      ) : (
        <ul className="flex flex-col gap-2 h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-track-rounded scrollbar-thumb-teal-500 scrollbar-track-gray-200">
          {comments.map((comment, idx) => (
            <li
              className="border-2 rounded h-[100px]  flex gap-2 break-words"
              key={comment.id + idx}
            >
              <Link
                className="h-full  rounded"
                href={`/user/${comment.userId}`}
              >
                <Image
                  width={20}
                  height={20}
                  src={comment.userImage}
                  alt={comment.userName}
                  className="h-full min-w-[100px] rounded"
                />
              </Link>
              <div className="flex flex-col">
                <div className="flex  gap-4 items-center">
                  <h1 className="font-bold text-teal-500">
                    {comment.userName}
                  </h1>
                  <div className="flex gap-1 items-center">
                    {loggedInUser &&
                    comment?.likedByUsers.includes(loggedInUser?.id) ? (
                      <button
                        onClick={(e) =>
                          unlikeButton(
                            e,
                            "comments",
                            comment.id,
                            loggedInUser.id
                          )
                        }
                      >
                        <FiThumbsUp className="text-lg cursor-pointer text-teal-500 hover:text-black" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) =>
                          likeButton(
                            e,
                            "comments",
                            comment.id,
                            loggedInUser?.id
                          )
                        }
                      >
                        <FiThumbsUp className="text-lg cursor-pointer hover:text-teal-500" />
                      </button>
                    )}

                    <p>{comment?.likedByUsers.length}</p>
                  </div>
                  {comment.userId === loggedInUser?.id && (
                    <button onClick={(e) => deleteComment(e, comment.id)}>
                      <ImBin className="text-lg cursor-pointer hover:text-red-400" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-500">{comment.date}</p>
                <p className="overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-track-rounded scrollbar-thumb-teal-500 scrollbar-track-gray-200">
                  {comment.comment}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Comments;
