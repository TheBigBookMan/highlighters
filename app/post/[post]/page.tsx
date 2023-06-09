import Post from "@/components/post/Post";
import Comments from "@/components/post/Comments";

// ? Params of the postID in the URL
const PostPage = ({ params }: Params) => {
  return (
    <div className="p-4 md:px-12 md:max-h-[700px]">
      <h1 className="font-bold text-2xl text-teal-500">Highlight</h1>
      <div className="md:mx-auto w-full flex flex-col md:flex-row">
        <Post params={params} />
        <Comments params={params} />
      </div>
    </div>
  );
};

export default PostPage;
