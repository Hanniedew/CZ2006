import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, useGetUsers } from "../../Firebase";
import "../../PagesCSS/Forum/Forum.css";
import Time from "../../Components/DatePosted";
import SearchBar from "../../Components/SearchBar";
import FilterPost from "../../Components/FilterPost";
import { useGetPostsReplies } from "./PostController";
import Card from "../../Components/PostCard";
import avatar from "../../PagesCSS/Dashboard/avatar.png";
import { Backdrop, CircularProgress } from "@mui/material";
import { toast } from "react-toastify";

// TODO: Forum Title CSS
// TODO: Animated video header CSS
// ADDITIONAL: Delete Post Option?
// ADDITIONAL: Pagination of the posts

function ForumUI() {
  const user = useAuth();
  const userList = useGetUsers();
  const [postList, replyList] = useGetPostsReplies();
  const [filteredPost, setFilteredPost] = useState([]);
  const [textEntered, setTextEntered] = useState("");
  const [chosen, setChosen] = useState("Latest");
  const navigate = useNavigate();

  const getRepliesNo = (post) => {
    return replyList.filter((reply) => reply.values.postId === post.id).length;
  };
  const arrangeByAct = () => {
    return postList
      .map((post) => post)
      .sort((a, b) => getRepliesNo(b) - getRepliesNo(a));
  };

  const arrangeByOld = () => {
    return postList
      .map((post) => post)
      .sort((a, b) => a.values.createdAt - b.values.createdAt);
  };

  const list =
    chosen === "Latest"
      ? postList
      : chosen === "Oldest"
      ? arrangeByOld()
      : arrangeByAct();

  const handleFilter = (event) => {
    const searchTerm = event.target.value;
    setTextEntered(searchTerm);
    const newFilter = list.filter((post) => {
      return post.values.title.toLowerCase().includes(searchTerm.toLowerCase());
    });
    searchTerm === "" ? setFilteredPost([]) : setFilteredPost(newFilter);
  };

  const userExist = (uid) => {
    if (userList.some((person) => person.uid === uid)) {
      return userList.filter((person) => person.uid === uid);
    } else return false;
  };

  return (
    <div>
      {!userList ? (
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      ) : (
        <div className="forum-mainpage">
          <h1 className="forum-title"> Forum Page </h1>
          <div className="forum-header">
            <div
              className="forum-create-post"
              onClick={() =>
                user && user.emailVerified
                  ? navigate("/forum/CreatePost")
                  : !user.emailVerified
                  ? toast("Please verify your email.", { type: "error" })
                  : navigate("/login")
              }
            >
              Create Post
            </div>
            <div className="search-input-with-dropdown">
              <SearchBar
                placeholder="Search"
                handleFilter={handleFilter}
                filteredPost={filteredPost}
                setFilteredPost={setFilteredPost}
                textEntered={textEntered}
                setTextEntered={setTextEntered}
              />
              <div className="vertical-divider"></div>
              <FilterPost chosen={chosen} setChosen={setChosen} />
            </div>
          </div>
          <div className="posts">
            {/* Filtered by search after selection from dropdown*/}
            {filteredPost.length !== 0 && textEntered.length !== 0 ? (
              filteredPost.map((post) => {
                return (
                  <div key={post.id}>
                    <div className="posts-header">
                      <img
                        className="posts-user-img"
                        src={
                          userExist(post.author.uid) && post.author.photoURL
                            ? post.author.photoURL
                            : avatar
                        }
                        alt="avatar"
                      />
                      <p className="posts-user-name">
                        {userExist(post.author.uid) && !post.values.toggle
                          ? userExist(post.author.uid)[0].name
                          : userExist(post.author.uid) && post.values.toggle
                          ? "Anonymous"
                          : "Deleted User"}
                      </p>
                      <Time content={post} />
                    </div>
                    <Card content={post} />
                  </div>
                );
              })
            ) : /* No Posts */
            textEntered.length !== 0 || list.length === 0 ? (
              <div> No posts available... </div>
            ) : (
              /* Filtered by dropdown*/
              list.map((post) => {
                return (
                  <div key={post.id}>
                    <div className="posts-header">
                      <img
                        className="posts-user-img"
                        src={
                          userExist(post.author.uid) && post.author.photoURL
                            ? post.author.photoURL
                            : avatar
                        }
                        alt="avatar"
                      />
                      <p className="posts-user-name">
                        {userExist(post.author.uid) && !post.values.toggle
                          ? userExist(post.author.uid)[0].name
                          : userExist(post.author.uid) && post.values.toggle
                          ? "Anonymous"
                          : "Deleted User"}
                      </p>
                      <Time content={post} />
                    </div>
                    <Card content={post} />
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ForumUI;
