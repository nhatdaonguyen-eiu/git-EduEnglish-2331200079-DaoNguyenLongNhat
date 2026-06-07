import { useState } from 'react';
import { Search, Star, Award, GraduationCap, Clock, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';

const TEACHERS_DATA = [
  {
    id: 1,
    name: 'Dr. Sarah Jenkins',
    role: 'Trưởng bộ môn IELTS',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200',
    specialties: ['IELTS'],
    rating: 5,
    experience: '12 năm',
    qualification: 'Tiến sĩ Ngôn ngữ học Anh (Đại học Cambridge)',
    bio: 'Đam mê truyền cảm hứng và giúp học viên đạt mục tiêu IELTS từ 7.5 trở lên bằng phương pháp tư duy phản biện.',
    achievements: ['Cựu giám khảo chấm thi IELTS viết & nói', 'Tác giả sách "IELTS Writing Masterclass"']
  },
  {
    id: 2,
    name: 'Thầy Trần Minh Hoàng',
    role: 'Chuyên gia Luyện thi TOEIC',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200',
    specialties: ['TOEIC'],
    rating: 5,
    experience: '8 năm',
    qualification: 'Thạc sĩ Giáo dục (Đại học Melbourne), TOEIC 990 Tuyệt đối',
    bio: 'Chuyên gia thiết kế các mẹo làm bài thi TOEIC tốc độ cao và tối ưu hóa điểm số cho người bận rộn.',
    achievements: ['Đào tạo hơn 2,000 học viên đạt mục tiêu TOEIC 750+', 'Cố vấn chuyên môn cho các tập đoàn đa quốc gia']
  },
  {
    id: 3,
    name: 'Cô Emma Thompson',
    role: 'Giảng viên Tiếng Anh Giao tiếp bản xứ',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200',
    specialties: ['Giao tiếp'],
    rating: 5,
    experience: '10 năm',
    qualification: 'Chứng chỉ giảng dạy quốc tế CELTA & DELTA',
    bio: 'Mang không khí tự nhiên của người bản xứ vào lớp học, tập trung cải thiện phát âm chuẩn IPA và sự tự tin khi nói.',
    achievements: ['Sáng lập câu lạc bộ tiếng Anh EduEnglish Club', 'Nhận giải thưởng Giảng viên Xuất sắc nhất năm 2024']
  },
  {
    id: 4,
    name: 'Cô Nguyễn Mai Chi',
    role: 'Giảng viên IELTS Academic',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200',
    specialties: ['IELTS'],
    rating: 5,
    experience: '6 năm',
    qualification: 'Cử nhân Sư phạm Tiếng Anh xuất sắc (Đại học Ngoại ngữ), IELTS 8.5',
    bio: 'Phương pháp dạy học trực quan sinh động, biến các chủ đề từ vựng và ngữ pháp IELTS phức tạp trở nên dễ nhớ.',
    achievements: ['Huấn luyện thành công 80+ học viên đạt band 7.0+', '95% học viên phản hồi hài lòng vượt mong đợi']
  },
  {
    id: 5,
    name: 'Thầy Robert Chen',
    role: 'Giảng viên Tiếng Anh Giao tiếp & Thương mại',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200',
    specialties: ['Giao tiếp', 'TOEIC'],
    rating: 5,
    experience: '9 năm',
    qualification: 'Thạc sĩ Quản trị Kinh doanh (MBA) & Chứng chỉ giảng dạy TESOL',
    bio: 'Tập trung vào tiếng Anh ứng dụng trong môi trường công sở, kỹ năng thuyết trình, đàm phán và viết email chuyên nghiệp.',
    achievements: ['Thiết kế lộ trình Business English cho ngân hàng EIU Bank', 'Học viên đỗ phỏng vấn các công ty Big 4']
  },
  {
    id: 6,
    name: 'Cô Lê Hoàng Linh',
    role: 'Chuyên gia Luyện viết IELTS (Writing)',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200',
    specialties: ['IELTS'],
    rating: 5,
    experience: '7 năm',
    qualification: 'Thạc sĩ Phương pháp Giảng dạy tiếng Anh (MA TESOL)',
    bio: 'Cam kết bẻ gãy nỗi sợ hãi viết bài thi IELTS Task 1 & Task 2 bằng hệ thống dàn ý logic chuẩn học thuật.',
    achievements: ['Sở hữu kênh chia sẻ kiến thức IELTS viết đạt 100k followers', 'IELTS Writing Đạt điểm số 9.0']
  }
];

function TeacherTeam() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('Tất cả');

  // Filter teachers based on search term and specialty
  const filteredTeachers = TEACHERS_DATA.filter((teacher) => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          teacher.role.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          teacher.qualification.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === 'Tất cả' || teacher.specialties.includes(selectedSpecialty);
    
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Hero Header */}
      <section className="bg-emerald-950 text-white py-16 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900 via-emerald-950 to-emerald-950 opacity-80 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center flex flex-col items-center">
          <span className="px-3 py-1 bg-emerald-800 text-amber-400 border border-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm flex items-center gap-1.5 w-fit">
            <Sparkles className="w-3.5 h-3.5" /> Đội ngũ học thuật xuất sắc
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-4">
            Đội Ngũ Giảng Viên EduEnglish
          </h1>
          <p className="text-emerald-200 text-xs sm:text-sm font-medium mt-2 max-w-2xl leading-relaxed">
            Học tập cùng các chuyên gia hàng đầu sở hữu bằng cấp quốc tế, kinh nghiệm giảng dạy dày dặn và tràn đầy nhiệt huyết định hướng tương lai cho bạn.
          </p>
        </div>
      </section>

      {/* Filter and Search Section */}
      <div className="max-w-6xl mx-auto px-6 mt-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Custom Tabs Filter */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {['Tất cả', 'IELTS', 'TOEIC', 'Giao tiếp'].map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer border ${
                  selectedSpecialty === spec
                    ? 'bg-emerald-850 text-white border-emerald-800 shadow-md shadow-emerald-900/10'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                {spec === 'Tất cả' ? '🎯 Tất cả giảng viên' : spec === 'Giao tiếp' ? '💬 Tiếng Anh Giao tiếp' : `📚 Chuyên môn ${spec}`}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Tìm tên giảng viên, học vị..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-700 text-slate-800 bg-slate-50/50"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          </div>

        </div>
      </div>

      {/* Teachers Grid */}
      <div className="max-w-6xl mx-auto px-6 mt-8">
        {filteredTeachers.length === 0 ? (
          <div className="py-20 bg-white rounded-3xl border border-slate-200/60 shadow-sm text-center max-w-lg mx-auto px-6">
            <p className="text-5xl">👨‍🏫</p>
            <h3 className="text-base font-bold text-slate-700 mt-4">Không tìm thấy giảng viên phù hợp</h3>
            <p className="text-slate-400 text-xs mt-1">Vui lòng thử tìm kiếm với từ khóa khác.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {filteredTeachers.map((teacher) => (
              <div 
                key={teacher.id} 
                className="bg-white rounded-2xl border border-slate-250/50 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300 hover:-translate-y-1 group"
              >
                <div>
                  {/* Top Color Banner Accent */}
                  <div className="h-2 bg-gradient-to-r from-emerald-700 to-emerald-950"></div>
                  
                  <div className="p-6">
                    {/* Header Info */}
                    <div className="flex gap-4">
                      <img 
                        src={teacher.avatar} 
                        alt={teacher.name} 
                        className="w-16 h-16 rounded-xl object-cover border border-slate-100 shadow-sm shrink-0"
                      />
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-800 group-hover:text-emerald-900 transition-colors">
                          {teacher.name}
                        </h3>
                        <p className="text-xs font-bold text-amber-500 mt-0.5">{teacher.role}</p>
                        
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {[...Array(teacher.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Stats/Badges */}
                    <div className="mt-5 grid grid-cols-2 gap-3 border-y border-slate-100 py-3 text-[11px] font-bold text-slate-650">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Kinh nghiệm: {teacher.experience}</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-end text-right">
                        <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">
                          {teacher.specialties.map(s => s === 'Giao tiếp' ? 'Giao tiếp' : s).join(' & ')}
                        </span>
                      </div>
                    </div>

                    {/* Qualification Detail */}
                    <div className="mt-4 flex gap-2 items-start">
                      <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <p className="text-[11px] font-bold text-slate-700 leading-tight">
                        {teacher.qualification}
                      </p>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-slate-500 mt-3 font-semibold leading-relaxed line-clamp-3">
                      "{teacher.bio}"
                    </p>

                    {/* Key Achievements */}
                    <div className="mt-4 space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Thành tựu nổi bật:</p>
                      {teacher.achievements.map((ach, idx) => (
                        <div key={idx} className="flex gap-1.5 items-start text-[11px] font-bold text-slate-600 leading-tight">
                          <span className="text-emerald-500 shrink-0">✔</span>
                          <span>{ach}</span>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>

                {/* Footer Quick Action CTA */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">Tư vấn miễn phí</span>
                  <button 
                    onClick={() => {
                      alert(`Đã ghi nhận yêu cầu nhận tư vấn lộ trình học cùng giảng viên ${teacher.name}! Tư vấn viên sẽ liên hệ với bạn trong vòng 15 phút.`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-550/10 hover:bg-emerald-850 hover:text-white text-emerald-800 text-[11px] font-black rounded-lg transition-all cursor-pointer border border-emerald-600/10"
                  >
                    Đăng ký học thử <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Academic Standard Banner */}
      <div className="max-w-6xl mx-auto px-6 mt-12">
        <div className="bg-emerald-950 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-900">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="text-left max-w-xl relative z-10">
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Bạn Cần Tìm Lộ Trình Học Phù Hợp Với Mục Tiêu?
            </h3>
            <p className="text-emerald-250 text-xs sm:text-sm font-semibold mt-1 leading-relaxed">
              Hãy để các chuyên gia học thuật của chúng tôi đánh giá trình độ và xây dựng giáo trình cá nhân hóa hoàn toàn miễn phí cho riêng bạn.
            </p>
          </div>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              alert('Vui lòng điền thông tin đăng ký tư vấn tại biểu mẫu đăng ký tư vấn ở đầu trang chủ!');
            }}
            className="px-5 py-3 bg-amber-400 hover:bg-amber-500 text-emerald-950 font-black text-xs rounded-xl shadow-lg hover:shadow-amber-400/20 active:scale-95 transition-all cursor-pointer border-none shrink-0 relative z-10"
          >
            Đăng Ký Tư Vấn Ngay ⚡
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeacherTeam;
