import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="text-center max-w-md">
                {/* Illustration */}
                <div className="mb-8">
                    <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary-500/20 to-primary-600/20 
                          flex items-center justify-center mb-6">
                        <span className="text-6xl">🍽️</span>
                    </div>
                    <h1 className="text-[120px] font-black text-gradient leading-none">
                        404
                    </h1>
                </div>

                {/* Message */}
                <h2 className="text-2xl font-bold text-white mb-3">
                    页面未找到
                </h2>
                <p className="text-neutral-400 mb-8">
                    抱歉，您访问的餐厅或页面不存在。请检查您扫描的二维码是否正确。
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/"
                        className="btn-primary inline-flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        <span>返回首页</span>
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="btn-secondary inline-flex items-center justify-center gap-2"
                    >
                        <Search className="w-5 h-5" />
                        <span>返回上页</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
