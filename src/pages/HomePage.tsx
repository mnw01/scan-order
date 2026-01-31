import { Link } from 'react-router-dom';
import { ChefHat, Utensils, QrCode, Zap, Shield, Smartphone, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export function HomePage() {
    return (
        <div className="w-full min-h-screen bg-zinc-950 text-white overflow-hidden selection:bg-orange-500/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[100px] rounded-full" />
            </div>

            {/* Navigation */}
            <nav className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-orange-500/20">
                                <Utensils className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold font-display tracking-tight">扫码点餐</span>
                        </div>
                        <Link to="/login">
                            <Button variant="secondary" size="sm">
                                商家登录
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-24 pb-32 overflow-hidden">
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    {/* Badge */}
                    <div className="mb-8 flex justify-center">
                        <Badge variant="primary" className="pl-2 pr-4 py-1.5 gap-2 text-sm">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/20">
                                <Zap className="h-3 w-3 text-orange-400" />
                            </span>
                            多租户 SaaS 餐饮系统
                        </Badge>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-5xl font-bold tracking-tight sm:text-7xl lg:text-8xl mb-8">
                        扫码点餐
                        <br />
                        <span className="text-gradient">
                            实时同步
                        </span>
                    </h1>

                    {/* Description */}
                    <p className="mx-auto max-w-2xl text-lg text-zinc-400 sm:text-xl leading-relaxed mb-12 text-balance">
                        为您的餐厅提供现代化的点餐解决方案。多设备实时同步、厨房订单管理、销售数据分析，一站式解决。
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
                        <Link to="/r/demo-restaurant/table/1">
                            <Button size="lg" className="group">
                                <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                                体验演示
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="secondary" size="lg">
                                开始使用
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative py-24 border-t border-white/5 bg-zinc-900/20">
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl mb-4">核心功能</h2>
                        <p className="mx-auto max-w-2xl text-lg text-zinc-400">
                            专为现代餐饮业设计的全功能解决方案
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
                        {/* Feature 1 */}
                        <Card hoverable className="group">
                            <div className="mb-6 inline-flex p-3 rounded-xl bg-red-500/10 text-red-500 group-hover:scale-110 transition-transform">
                                <QrCode className="h-8 w-8" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold text-zinc-100">扫码点餐</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                顾客扫描桌码即可点餐，无需等待服务员，同桌客人实时共享购物车
                            </p>
                        </Card>

                        {/* Feature 2 */}
                        <Card hoverable className="group">
                            <div className="mb-6 inline-flex p-3 rounded-xl bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform">
                                <ChefHat className="h-8 w-8" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold text-zinc-100">厨房管理</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                实时接收订单通知，看板式订单管理，一键更新订单状态
                            </p>
                        </Card>

                        {/* Feature 3 */}
                        <Card hoverable className="group">
                            <div className="mb-6 inline-flex p-3 rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:scale-110 transition-transform">
                                <Shield className="h-8 w-8" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold text-zinc-100">多租户架构</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                数据完全隔离，每家餐厅独立管理，安全可靠的 SaaS 架构
                            </p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-24 border-t border-white/5">
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <Badge variant="secondary" className="mb-8">
                        <Smartphone className="h-4 w-4 mr-2" />
                        移动优先设计
                    </Badge>

                    <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl mb-6">
                        准备好升级您的餐厅了吗？
                    </h2>
                    <p className="mx-auto max-w-xl text-lg text-zinc-400 mb-10">
                        立即开始使用我们的扫码点餐系统，提升顾客体验，优化餐厅运营
                    </p>
                    <Link to="/login">
                        <Button size="lg" className="animate-pulse-slow">
                            免费开始
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 bg-zinc-950 py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-sm text-zinc-500">
                        <p>© 2026 扫码点餐系统. All rights reserved.</p>
                        <p className="mt-2 text-zinc-600">Built with Supabase + React</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
