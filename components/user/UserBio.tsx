"use client";
import { db } from "@/utils/firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useState, useEffect } from "react";
import { SlUserFollow, SlUserUnfollow } from "react-icons/sl";
import { auth } from "@/utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

// !!! fix params shouldnt be null on global for params
const UserBio = ({ params }: Params) => {
  const [user, loading] = useAuthState(auth);
  const userId = params.user;
  const [userInfo, setUserInfo] = useState<User | undefined>();
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  const getData = async () => {
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap) {
        const docData = docSnap.data();
        setUserInfo({ ...docData });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const updateUser = async () => {
    try {
      const collectionUsersRef = collection(db, "users");
      const q = query(collectionUsersRef, where("googleId", "==", user?.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        let userData;
        snapshot.docs.forEach(async (doc) => {
          userData = doc.data();
          setLoggedInUser({ ...userData, id: doc.id });
        });
      });
      return unsubscribe;
    } catch (err) {
      console.log(err);
    }
  };

  const followUser = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "users", loggedInUser?.id);
      const docSnap = await getDoc(docRef);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (userId) {
      getData();
    }
    if (user) {
      updateUser();
    }
  }, [user]);

  let follows = false;
  console.log(loggedInUser);
  console.log(userInfo);
  return (
    <div className="flex gap-4 md:px-16 h-[140px] w-full shadow-xl rounded-xl p-2">
      <img
        src={userInfo?.image}
        alt={userInfo?.displayName}
        className="w-20 h-20 rounded-full"
      />
      <div className="flex flex-col w-full max-w-[400px]">
        <div className="flex justify-between items-center pr-4">
          <div className="flex flex-col gap-1">
            <div className="flex gap-2 items-center">
              <h1 className="font-bold text-teal-500">
                {userInfo?.displayName}
              </h1>
              {follows ? (
                <button className="flex gap-2 items-center bg-red-400 w-[120px] py-1 px-4 rounded-xl text-white hover:bg-red-600">
                  <SlUserUnfollow />
                  Unfollow
                </button>
              ) : (
                <button className="flex gap-2 items-center bg-teal-500 w-[120px] py-1 px-4 rounded-xl text-white hover:bg-teal-600">
                  <SlUserFollow />
                  Follow
                </button>
              )}
            </div>
            <p
              className={`overflow-x-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-track-rounded scrollbar-thumb-teal-500 scrollbar-track-gray-200`}
            >
              {userInfo?.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBio;