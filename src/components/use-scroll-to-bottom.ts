import { useEffect, useRef, RefObject } from "react";

export function useScrollToBottom<T extends HTMLElement>(): [
  RefObject<T | null>,
  RefObject<T | null>,
] {
  const containerRef = useRef<T | null>(null);
  const endRef = useRef<T | null>(null);
  const shouldScrollRef = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (!container || !end) {
      return;
    }

    // 检查是否在底部附近（比如距离底部 100px 以内）
    const isNearBottom = () => {
      const container = containerRef.current;
      if (!container) return false;
      const threshold = 100; // 可以调整这个值
      return (
        container.scrollHeight - container.scrollTop - container.clientHeight <=
        threshold
      );
    };

    // 监听滚动事件
    const handleScroll = () => {
      shouldScrollRef.current = isNearBottom();
    };

    container.addEventListener("scroll", handleScroll);

    // 创建观察器
    const observer = new MutationObserver(() => {
      if (shouldScrollRef.current) {
        end.scrollIntoView({ behavior: "smooth" });
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
    });

    // 清理函数
    return () => {
      observer.disconnect();
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return [containerRef, endRef];
}
