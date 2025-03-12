import { PlainTextToolResult } from "@/tools/utils";

interface XHSComment {
  id: string;
  content: string;
  user: {
    userid: string;
    nickname: string;
    images: string;
  };
  like_count: number;
  liked: boolean;
  sub_comment_count: number;
}

export interface XHSNoteCommentsResult extends PlainTextToolResult {
  comments: XHSComment[];
}

function parseXHSNoteComments(data: {
  data: {
    comments: XHSComment[];
  };
}): XHSNoteCommentsResult {
  // 只取前十条
  const topComments = (data?.data?.comments ?? []).slice(0, 10);
  const comments = topComments.map((comment) => {
    return {
      id: comment.id,
      content: comment.content,
      user: {
        userid: comment.user.userid,
        nickname: comment.user.nickname,
        images: comment.user.images,
      },
      like_count: comment.like_count,
      liked: comment.liked,
      sub_comment_count: comment.sub_comment_count,
    };
  });
  const plainText = JSON.stringify(
    comments.map((comment) => ({
      userid: comment.user.userid,
      nickname: comment.user.nickname,
      content: comment.content,
    })),
  );
  return {
    comments,
    plainText,
  };
}

export async function xhsNoteComments({ noteid }: { noteid: string }) {
  try {
    const params = {
      token: process.env.XHS_API_TOKEN!,
      noteId: noteid,
    };
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(
      `${process.env.XHS_API_BASE_URL}/get-note-comment/v2?${queryString}`,
    );
    const data = await response.json();
    console.log("Response text:", JSON.stringify(data).slice(0, 100));
    const result = parseXHSNoteComments(data);
    return result;
  } catch (error) {
    console.error("Error fetching XHS note comments:", error);
    throw error;
  }
}
