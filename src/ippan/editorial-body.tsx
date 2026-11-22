"use client";
import ReactMarkdown from "react-markdown";
export function EditorialBody({ body }: { body: string }) {
  return (
    <div className="editorial-body">
      <ReactMarkdown
        skipHtml
        allowedElements={[
          "p",
          "h2",
          "h3",
          "h4",
          "strong",
          "em",
          "ul",
          "ol",
          "li",
          "a",
          "blockquote",
          "br",
          "hr",
          "code",
          "pre",
        ]}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}
