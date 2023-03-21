"use client";
import { db } from "@/utils/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const Post = ({ params }: Params) => {
  const postId = params?.post;
  const route = useRouter();
  const [postData, setPostData] = useState<Post | null>(null);

  const getData = async () => {
    try {
      const docRef = doc(db, "posts", postId);
      const docSnap = await getDoc(docRef);
      if (docSnap) {
        const docData = docSnap.data();
        setPostData({ ...docData });
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  console.log(postData);

  //? router  not getting params from url
  return (
    <div>
      <h1>Postsss</h1>
    </div>
  );
};

export default Post;