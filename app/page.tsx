"use client";
import { useState, useEffect } from "react";
import { UserPost, Post } from "./UserPost";
import axios from "axios";

const NOTES_URL: string = "http://localhost:3001/notes";
const POSTS_PER_PAGE: number = 10;

export default function Home() {
  const [activePage, setActivePage] = useState(1);
  const [total_num_of_pages, set_total_num_of_pages] = useState(1);
  const [user_posts, set_user_posts] = useState<Post[]>([]);
  const [total_num_of_posts, set_total_num_of_posts] = useState(0);

  function handlePagesButtons(): number[] {
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
  function handlePageClick(next_page: number): void {
    setActivePage(next_page);
  }
  useEffect(() => {
    const promise = axios.get(NOTES_URL, {
      params: {
        _page: activePage,
        _per_page: POSTS_PER_PAGE,
      },
    });
    promise
      .then((response) => {
        set_user_posts(response.data);
      })
      .catch((error) => {
        console.log("Encountered an error:" + error);
      });
  }, [activePage]);

  useEffect(() => {
    const promise = axios
      .get(NOTES_URL)
      .then((response) => {
        set_total_num_of_posts(response.data.length);
        set_total_num_of_pages(Math.ceil(total_num_of_posts / POSTS_PER_PAGE));
      })
      .catch((error) => {
        console.log("Encountered an error:" + error);
      });
  });

  return (
    <div>
      <div
        className="pagination"
        style={{ fontWeight: "bold", color: "#04AA6D", fontSize: "24px" }}
      >
        NOTES
      </div>

      <div className="pagination">
        {user_posts.map((current_post) => (
          <UserPost
            key={current_post.id}
            id={current_post.id}
            title={current_post.title}
            author={current_post.author}
            content={current_post.content}
          />
        ))}
      </div>

      <div className="pagination">
        <button
          name="previous"
          onClick={() => handlePageClick(activePage == 1 ? 1 : activePage - 1)}
        >
          Prev
        </button>
        <button name="first" onClick={() => handlePageClick(1)}>
          First
        </button>

        {handlePagesButtons().map((page: number) => (
          <button
            name={"page-${page}"}
            key="{page}"
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
              activePage == total_num_of_pages
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
