"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Post, UserPost } from "./UserPost";

const NOTES_URL = "http://localhost:3001/notes";
const POSTS_PER_PAGE = 10;

export default function Home() {
  const [activePage, setActivePage] = useState(1);
  const [total_num_of_pages, set_total_num_of_pages] = useState(1);
  const [user_posts, set_user_posts] = useState<Post[]>([]);
  const [total_num_of_posts, set_total_num_of_posts] = useState(0);
  const [new_note, set_new_note] = useState({
    title: "",
    author: { name: "", email: "" },
    content: "",
  });
  const [edit_cont, set_edit_cont] = useState("");
  const [edit_pos, set_edit_pos] = useState<number | null>(null);
  const [show_new_note, set_show_new_note] = useState(false);
  const [theme, setTheme] = useState("light");

  function switchTheme() {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  }

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  function handlePagesButtons() {
    switch (true) {
      case total_num_of_pages <= 5:
        return Array.from({ length: total_num_of_pages }).map((_, i) => i + 1);
      case activePage < 3:
        return [1, 2, 3, 4, 5];
      case total_num_of_pages - activePage < 2:
        return [
          total_num_of_pages - 4,
          total_num_of_pages - 3,
          total_num_of_pages - 2,
          total_num_of_pages - 1,
          total_num_of_pages,
        ];
      default:
        return [
          activePage - 2,
          activePage - 1,
          activePage,
          activePage + 1,
          activePage + 2,
        ];
    }
  }

  function handlePageClick(next_page: number) {
    setActivePage(next_page);
  }

  const fetch_notes = async () => {
    try {
      const response = await axios.get(NOTES_URL, {
        params: {
          _page: activePage,
          _per_page: POSTS_PER_PAGE,
        },
      });
      set_user_posts(response.data);
    } catch (error) {
      console.log("Encountered an error:", error);
    }
  };

  useEffect(() => {
    fetch_notes();
  }, [activePage]);

  useEffect(() => {
    const fetchTotalNotes = async () => {
      try {
        const response = await axios.get(NOTES_URL + "/total");
        set_total_num_of_posts(response.data.total);
        set_total_num_of_pages(Math.ceil(response.data.total / POSTS_PER_PAGE));
      } catch (error) {
        console.log("Encountered an error:", error);
      }
    };

    fetchTotalNotes();
  }, []);

  const create = async (newObject: any) => {
    try {
      const response = await axios.post(NOTES_URL, newObject);
      return response.data;
    } catch (error) {
      console.log("Error creating note:", error);
    }
  };

  const addNote = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const noteObject = {
      id: Math.floor(Math.random() * 100000),
      title: new_note.title,
      author: {
        name: new_note.author.name,
        email: new_note.author.email,
      },
      content: new_note.content,
    };

    try {
      const returnedNote = await create(noteObject);
      set_total_num_of_pages(
        Math.ceil((total_num_of_posts + 1) / POSTS_PER_PAGE)
      );
      set_new_note({ title: "", author: { name: "", email: "" }, content: "" });
      await fetch_notes();
      set_show_new_note(false);
    } catch (error) {
      console.log("Error adding note:", error);
    }
  };

  const handle_inp_change = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    set_show_new_note((prev_note: any) => ({
      ...prev_note,
      [name]: value,
    }));
  };

  const handle_auth_change = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    set_new_note((prev_note) => ({
      ...prev_note,
      author: {
        ...prev_note.author,
        [name]: value,
      },
    }));
  };

  const del_note = async (position: number) => {
    try {
      await axios.delete(`${NOTES_URL}/${position}`);
      await fetch_notes();
      if (total_num_of_posts % 10 === 0) {
        setActivePage(activePage - 1);
        set_total_num_of_pages(total_num_of_pages - 1);
      }
    } catch (error) {
      console.log("Error deleting note:", error);
    }
  };

  const sta_edit = (position: number, content: string) => {
    set_edit_pos(position);
    set_edit_cont(content);
  };

  const save_edit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (edit_pos !== null) {
      try {
        await axios.put(`${NOTES_URL}/${edit_pos}`, {
          content: edit_cont,
        });
        set_edit_cont("");
        set_edit_pos(null);
        await fetch_notes();
      } catch (error) {
        console.log("Error updating note:", error);
      }
    }
  };

  return (
    <div className={theme}>
      <div
        className="text-center"
        style={{ fontWeight: "bold", color: "#04AA6D", fontSize: "24px" }}
      >
        NOTES
      </div>

      <div className="text-center">
        <button name="change_theme" onClick={switchTheme}>
          {theme === "light" ? "Switch to Dark Theme" : "Switch to Light Theme"}
        </button>
        <button name="add_new_note" onClick={() => set_show_new_note(true)}>
          Add Note
        </button>
        {show_new_note && (
          <form onSubmit={addNote}>
            <div className="user-post">
              <input
                type="text"
                name="title"
                value={new_note.title}
                onChange={handle_inp_change}
                placeholder="Title"
                required
              />
              <input
                type="text"
                name="name"
                value={new_note.author.name}
                onChange={handle_auth_change}
                placeholder="Author Name"
                required
              />
              <input
                type="email"
                name="email"
                value={new_note.author.email}
                onChange={handle_auth_change}
                placeholder="Author Email"
                required
              />
              <input
                type="text"
                name="content"
                value={new_note.content}
                onChange={handle_inp_change}
                placeholder="Content"
                required
              />
              <button name="text_input_save_new_note" type="submit">
                Save
              </button>
              <button
                name="text_input_cancel_new_note"
                type="button"
                onClick={() => set_show_new_note(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="text-center">
        {user_posts.map((current_post, index) => {
          const position = index + 1 + (activePage - 1) * POSTS_PER_PAGE;
          return (
            <div key={current_post.id}>
              {edit_pos === position ? (
                <form onSubmit={save_edit}>
                  <div>
                    <strong>Title: </strong>
                    {current_post.title}
                  </div>
                  <div>
                    <strong>Author: </strong>
                    {current_post.author.name}
                  </div>
                  <div>
                    <strong>Email: </strong>
                    {current_post.author.email}
                  </div>
                  <input
                    name={`text_input_save-${current_post.id}`}
                    type="text"
                    value={edit_cont}
                    onChange={(e) => set_edit_cont(e.target.value)}
                    placeholder="Edit Content"
                    required
                  />
                  <button
                    name={`text_input_save-${current_post.id}`}
                    type="submit"
                  >
                    Save
                  </button>
                  <button
                    name={`text_input_cancel-${current_post.id}`}
                    type="button"
                    onClick={() => set_edit_pos(null)}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div>
                  <UserPost
                    id={current_post.id}
                    title={current_post.title}
                    author={current_post.author}
                    content={current_post.content}
                  />
                  <button
                    name={`delete-${current_post.id}`}
                    onClick={() => del_note(position)}
                  >
                    Delete
                  </button>
                  <button
                    name={`edit-${current_post.id}`}
                    onClick={() => sta_edit(position, current_post.content)}
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <button
          name="previous"
          onClick={() => handlePageClick(activePage === 1 ? 1 : activePage - 1)}
        >
          Prev
        </button>
        <button name="first" onClick={() => handlePageClick(1)}>
          First
        </button>
        {handlePagesButtons().map((page) => (
          <button
            name={`page-${page}`}
            key={`${page}`}
            onClick={() => handlePageClick(page)}
            style={{ fontWeight: page === activePage ? "bolder" : "normal" }}
          >
            {page}
          </button>
        ))}
        <button
          name="next"
          onClick={() =>
            handlePageClick(
              activePage === total_num_of_pages
                ? total_num_of_pages
                : activePage + 1
            )
          }
        >
          Next
        </button>
        <button name="last" onClick={() => handlePageClick(total_num_of_pages)}>
          Last
        </button>
      </div>
    </div>
  );
}
