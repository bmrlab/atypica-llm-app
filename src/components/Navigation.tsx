import Link from "next/link";

export default function Navigation() {
  const menuItems = [
    { name: "首页", href: "/" },
    { name: "主题调研", href: "/analyst" },
    { name: "用户画像", href: "/personas" },
    { name: "发现用户", href: "/scout" },
  ];

  return (
    <nav className="fixed left-0 top-0 h-screen sm:px-2 2xl:px-6 pt-10 hidden sm:block">
      <div className="space-y-1">
        {menuItems.map((item) => {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
            >
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
