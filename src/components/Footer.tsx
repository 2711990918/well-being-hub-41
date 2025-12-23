import { Link } from "react-router-dom";
import { Leaf, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    platform: [
      { name: "关于我们", href: "/about" },
      { name: "服务条款", href: "/terms" },
      { name: "隐私政策", href: "/privacy" },
      { name: "联系我们", href: "/contact" },
    ],
    categories: [
      { name: "营养膳食", href: "/categories/nutrition" },
      { name: "运动健身", href: "/categories/fitness" },
      { name: "中医养生", href: "/categories/tcm" },
      { name: "心理健康", href: "/categories/mental" },
    ],
    resources: [
      { name: "健康资讯", href: "/articles" },
      { name: "专家团队", href: "/experts" },
      { name: "用户社区", href: "/community" },
      { name: "帮助中心", href: "/help" },
    ],
  };

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-semibold">养生堂</span>
            </Link>
            <p className="text-background/70 mb-6 max-w-sm">
              专注健康养生领域，为您提供科学、专业、全面的健康知识与服务
            </p>
            <div className="space-y-2 text-sm text-background/70">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>contact@yangsheng.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>400-888-8888</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>北京市朝阳区健康大厦</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">平台</h4>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">分类</h4>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">资源</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-background/50">
          <p>© 2024 养生堂. 保留所有权利.</p>
          <p>用心呵护您的健康生活</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
