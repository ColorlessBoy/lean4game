import * as React from "react";
import { useState, useRef, useEffect, Fragment, useCallback } from "react";
import MarkdownPreview from "@uiw/react-markdown-preview";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css"; // `rehype-katex` does not import the CSS for you
import gfm from "remark-gfm";

import { getCodeString } from "rehype-rewrite";
import mermaid from "mermaid";

function Markdown(props) {
  const newProps = {
    ...props,
    remarkPlugins: [...(props.remarkPlugins ?? []), remarkMath, gfm],
    rehypePlugins: [...(props.remarkPlugins ?? []), rehypeKatex],
  };
  return (
    <MarkdownPreview
      {...newProps}
      source={props.children}
      className="markdown"
      style={{
        backgroundColor: "transparent",
        padding: 0,
      }}
      components={{
        ul: ({ node, ...props }) => (
          <ul {...props} style={{ paddingLeft: "0px" }} />
        ),
        code: Code,
      }}
    />
  );
}

export default Markdown;

// inplicit component
mermaid.initialize({
  theme: "default",
  themeVariables: {
    background: "transparent",
  },
});

const randomid = () => parseInt(String(Math.random() * 1e15), 10).toString(36);
const Code = ({ inline, children = [], className, ...props }) => {
  const demoid = useRef(`dome${randomid()}`);
  const [container, setContainer] = useState(null);
  const isMermaid =
    className && /^language-mermaid/.test(className.toLocaleLowerCase());
  const code =
    props.node && props.node.children
      ? getCodeString(props.node.children)
      : children[0] || "";

  const reRender = async () => {
    if (container && isMermaid) {
      try {
        const str = await mermaid.render(demoid.current, code);
        container.innerHTML = str.svg;
      } catch (error) {
        container.innerHTML = error;
      }
    }
  };

  useEffect(() => {
    reRender();
  }, [container, isMermaid, code, demoid]);

  const refElement = useCallback((node) => {
    if (node !== null) {
      setContainer(node);
    }
  }, []);

  if (isMermaid) {
    return (
      <Fragment>
        <code id={demoid.current} style={{ display: "none" }} />
        <div ref={refElement} data-name="mermaid" />
      </Fragment>
    );
  }
  return (
    <code
      style={{ whiteSpace: inline ? "nowrap" : "pre-wrap" }} // 处理行内代码和块级代码
      className={className}
      {...props}
      id={demoid.current}
    >
      {children}
    </code>
  );
};
