"use client";
import { auth, db } from "@/utils/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Comments = ({ params }: Params) => {
  const [user, loading] = useAuthState(auth);
  const selectedPostId = params?.post;
  const [comments, setComments] = useState<Comment[]>([]);
  const [writeComment, setWriteComment] = useState<string>("");

  const getData = async () => {
    try {
      const collectionRef = collection(db, "comments");
      const q = query(collectionRef, where("postId", "==", selectedPostId));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        let lists: any = [];
        snapshot.docs.forEach(async (doc) => {
          await lists.push({ ...doc.data(), id: doc });
        });
        setComments([...lists]);
      });
      return unsubscribe;
    } catch (err) {
      console.log(err);
    }
  };

  const updateCommentCount = async () => {
    try {
      const docRef = doc(db, "posts", selectedPostId);
      const docSnap = await getDoc(docRef);
      console.log(docSnap.data());

      const commentData = docSnap.data();
      const updatedPost = {
        ...commentData,
        comments: commentData.comments + 1,
      };

      await updateDoc(docRef, updatedPost);
    } catch (err) {
      console.log(err);
    }
  };

  const createComment = async (e: MouseEvent<HTMLButtonElement>) => {
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
      });
      toast.success("Post successful!✅");
      setWriteComment("");
      updateCommentCount();
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="shadow-xl rounded-lg max-w-[600px]  p-2 flex flex-col gap-2">
      <ToastContainer limit={1} />
      <h1 className="font-bold text-teal-500 text-lg">Comments</h1>
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
        <ul className="flex flex-col gap-2 h-[540px] overflow-y-auto">
          {comments.map((comment, idx) => (
            <li
              className="border-2 rounded h-[100px]  flex gap-2"
              key={comment.id + idx}
            >
              <img
                src={comment.userImage}
                alt={comment.userName}
                className="h-full  rounded"
              />
              <div className="flex flex-col">
                <div className="flex  gap-4 items-center">
                  <h1 className="font-bold text-teal-500">
                    {comment.userName}
                  </h1>
                  <p className="text-sm">{comment.date}</p>
                </div>
                <p className="overflow-y-auto">{comment.comment}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Comments;