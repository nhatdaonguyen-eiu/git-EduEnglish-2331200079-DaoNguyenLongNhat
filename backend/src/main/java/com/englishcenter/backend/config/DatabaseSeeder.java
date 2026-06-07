package com.englishcenter.backend.config;

import com.englishcenter.backend.entity.*;
import com.englishcenter.backend.repository.*;
import com.englishcenter.backend.util.HashUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final PaymentConfigRepository paymentConfigRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final ClassroomRepository classroomRepository;
    private final ClassEnrollmentRepository classEnrollmentRepository;
    private final CourseMaterialRepository courseMaterialRepository;
    private final CourseActivityRepository courseActivityRepository;
    private final ActivityQuestionRepository activityQuestionRepository;
    private final StudentSubmissionRepository studentSubmissionRepository;
    private final SubmissionAnswerRepository submissionAnswerRepository;
    private final StudentBadgeRepository studentBadgeRepository;
    private final BlogPostRepository blogPostRepository;
    private final FreeMaterialRepository freeMaterialRepository;
    private final FreeMaterialQuestionRepository freeMaterialQuestionRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("🌱 [DATABASE SEEDER] Checking database status for mock data seeding...");

        // 1. Seed Payment Configurations
        if (paymentConfigRepository.count() == 0) {
            System.out.println("   -> Seeding Payment Configurations...");
            
            PaymentConfig bankTransfer = new PaymentConfig();
            bankTransfer.setGatewayKey("BANK_TRANSFER");
            bankTransfer.setGatewayName("Chuyển khoản Ngân hàng (Vietcombank)");
            bankTransfer.setAccountNumber("1014389021");
            bankTransfer.setAccountName("CONG TY ANH NGU EDUENGLISH");
            bankTransfer.setQrUrl("https://img.vietqr.io/image/vcb-1014389021-compact.png?amount=1000&addInfo=EDU");
            bankTransfer.setSyntaxTemplate("EDU {studentId} {classId}");
            bankTransfer.setIsActive(true);
            paymentConfigRepository.save(bankTransfer);

            PaymentConfig vnpay = new PaymentConfig();
            vnpay.setGatewayKey("VNPAY");
            vnpay.setGatewayName("Cổng thanh toán VNPay");
            vnpay.setAccountNumber("VNPAY_MERCHANT_ID");
            vnpay.setAccountName("EDUENGLISH CENTER");
            vnpay.setQrUrl("");
            vnpay.setSyntaxTemplate("EDU {studentId} {classId}");
            vnpay.setIsActive(true);
            paymentConfigRepository.save(vnpay);

            PaymentConfig momo = new PaymentConfig();
            momo.setGatewayKey("MOMO");
            momo.setGatewayName("Ví điện tử MoMo");
            momo.setAccountNumber("0987654321");
            momo.setAccountName("DAO NGUYEN LONG NHAT");
            momo.setQrUrl("");
            momo.setSyntaxTemplate("EDU {studentId} {classId}");
            momo.setIsActive(true);
            paymentConfigRepository.save(momo);

            PaymentConfig zalopay = new PaymentConfig();
            zalopay.setGatewayKey("ZALOPAY");
            zalopay.setGatewayName("Ví điện tử ZaloPay");
            zalopay.setAccountNumber("0987654321");
            zalopay.setAccountName("DAO NGUYEN LONG NHAT");
            zalopay.setQrUrl("");
            zalopay.setSyntaxTemplate("EDU {studentId} {classId}");
            zalopay.setIsActive(true);
            paymentConfigRepository.save(zalopay);
        }

        // 2. Seed Courses
        System.out.println("   -> Checking and Seeding Courses...");
        List<Course> existingCourses = courseRepository.findAll();

        if (existingCourses.stream().noneMatch(c -> c.getTitle().equalsIgnoreCase("IELTS Masterclass (0 - 6.5)"))) {
            Course course1 = new Course();
            course1.setTitle("IELTS Masterclass (0 - 6.5)");
            course1.setDescription("Khóa học luyện thi IELTS toàn diện từ con số 0 lên 6.5. Tập trung rèn luyện chuyên sâu phương pháp làm bài cho cả 4 kỹ năng Listening, Reading, Writing và Speaking.");
            course1.setLevel("Beginner");
            course1.setCategory("IELTS");
            course1.setPrice(new BigDecimal("6500000"));
            course1.setThumbnailUrl("https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&auto=format&fit=crop&q=60");
            course1.setSuitableFor("Học sinh, sinh viên, người đi làm muốn lấy chứng chỉ IELTS từ căn bản hoặc người bị mất gốc tiếng Anh.");
            course1.setOutputGoals("Cam kết đầu ra IELTS 6.5+, làm chủ toàn diện cấu trúc đề thi, viết luận mạch lạc và phản xạ nói tự nhiên.");
            course1.setDuration("6 tháng (72 buổi)");
            course1.setCommitment("Cam kết hỗ trợ học lại hoàn toàn miễn phí nếu học viên đi học đầy đủ và làm bài tập đầy đủ nhưng không đạt mục tiêu đầu ra.");
            course1.setLearningMethod("Học trực tiếp trên lớp với giảng viên bản xứ và trợ giảng Việt Nam, kết hợp tự luyện tập cá nhân hóa trên hệ thống LMS.");
            course1.setSyllabus("Tháng 1-2: Ngữ pháp nền tảng cốt lõi & Phát âm chuẩn IPA. Tháng 3-4: Tiếp cận chi tiết phương pháp làm bài cho 4 kỹ năng thi IELTS. Tháng 5-6: Giải đề thi thực tế áp lực thời gian và thi thử định kỳ.");
            course1.setIsDeleted(false);
            courseRepository.save(course1);
        }

        if (existingCourses.stream().noneMatch(c -> c.getTitle().equalsIgnoreCase("TOEIC Chinh Phục 750+"))) {
            Course course2 = new Course();
            course2.setTitle("TOEIC Chinh Phục 750+");
            course2.setDescription("Khóa học TOEIC chuyên sâu giúp học viên làm chủ hoàn toàn ngữ pháp trọng điểm, bẫy từ vựng thương mại và các mẹo giải đề thi TOEIC Reading & Listening đạt mốc 750+ điểm.");
            course2.setLevel("Intermediate");
            course2.setCategory("TOEIC");
            course2.setPrice(new BigDecimal("4500000"));
            course2.setThumbnailUrl("https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop&q=60");
            course2.setSuitableFor("Sinh viên các trường đại học cần chứng chỉ để tốt nghiệp ra trường hoặc người đi làm cần cải thiện tiếng Anh thương mại.");
            course2.setOutputGoals("Đạt chứng chỉ TOEIC Listening & Reading từ 750 điểm trở lên.");
            course2.setDuration("3 tháng (36 buổi)");
            course2.setCommitment("Hoàn tiền hoặc hỗ trợ học lại khóa sau nếu không vượt qua mốc điểm cam kết đầu ra.");
            course2.setLearningMethod("Luyện đề thực chiến, giải mã chi tiết các lỗi sai thường gặp, tăng tốc từ vựng qua kho đề số hóa.");
            course2.setSyllabus("Tuần 1-4: Tổng ôn ngữ pháp và từ vựng 12 chủ điểm thương mại chính. Tuần 5-8: Chiến thuật giải nhanh Part 1-7. Tuần 9-12: Chinh phục đề thi thật và rèn luyện tâm lý phòng thi.");
            course2.setIsDeleted(false);
            courseRepository.save(course2);
        }

        if (existingCourses.stream().noneMatch(c -> c.getTitle().equalsIgnoreCase("Tiếng Anh Giao Tiếp Thực Chiến"))) {
            Course course3 = new Course();
            course3.setTitle("Tiếng Anh Giao Tiếp Thực Chiến");
            course3.setDescription("Khóa học tiếng Anh giao tiếp phản xạ tự nhiên giúp học viên vượt qua rào cản sợ nói, sửa lỗi phát âm và tự tin đàm thoại trong công việc và đời sống hàng ngày.");
            course3.setLevel("Beginner");
            course3.setCategory("Giao tiếp");
            course3.setPrice(new BigDecimal("3500000"));
            course3.setThumbnailUrl("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=60");
            course3.setSuitableFor("Học viên mất gốc giao tiếp, từ vựng hạn chế, phát âm chưa chuẩn hoặc bị bí từ khi phải giao tiếp với người nước ngoài.");
            course3.setOutputGoals("Tự tin phỏng vấn bằng tiếng Anh, thảo luận công việc trôi chảy và làm chủ các hội thoại đời sống xã hội.");
            course3.setDuration("3 tháng (36 buổi)");
            course3.setCommitment("Cam kết tăng phản xạ giao tiếp tự nhiên sau 1 khóa học duy nhất.");
            course3.setLearningMethod("Thực hành đóng vai (role-play) các tình huống thực tế, tập nói ghi âm cá nhân hóa.");
            course3.setSyllabus("Tháng 1: Phát âm chuẩn IPA & Giao tiếp xã hội cơ bản. Tháng 2: Giao tiếp môi trường công sở, viết email và làm việc nhóm. Tháng 3: Thuyết trình, đàm phán và tranh luận các chủ đề nâng cao.");
            course3.setIsDeleted(false);
            courseRepository.save(course3);
        }

        if (existingCourses.stream().noneMatch(c -> c.getTitle().equalsIgnoreCase("IELTS Advanced (Band 6.5 - 7.5+)"))) {
            Course course4 = new Course();
            course4.setTitle("IELTS Advanced (Band 6.5 - 7.5+)");
            course4.setDescription("Khóa học bứt phá điểm số dành cho học viên đã đạt IELTS 6.0 muốn nâng band điểm lên 7.5+. Rèn luyện chuyên sâu tư duy phản biện học thuật cho hai kỹ năng khó nhất là Writing & Speaking.");
            course4.setLevel("Advanced");
            course4.setCategory("IELTS");
            course4.setPrice(new BigDecimal("8500000"));
            course4.setThumbnailUrl("https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=60");
            course4.setSuitableFor("Học viên đã có chứng chỉ IELTS 6.0 hoặc đạt kết quả đánh giá đầu vào tương đương.");
            course4.setOutputGoals("Cam kết đầu ra IELTS 7.5+, viết luận sắc bén logic và nói tiếng Anh học thuật lưu loát.");
            course4.setDuration("4 tháng (48 buổi)");
            course4.setCommitment("Cam kết hỗ trợ học lại miễn phí hoặc hoàn trả một phần lệ phí thi nếu không đạt band điểm cam kết.");
            course4.setLearningMethod("Luyện tập chấm chữa bài viết chi tiết hàng tuần và luyện nói phản xạ 1-1 với giảng viên nước ngoài.");
            course4.setSyllabus("Tháng 1-2: Làm chủ các chủ đề xã hội học thuật phức tạp, cải thiện vốn từ vựng nâng cao. Tháng 3-4: Thực hành chiến lược làm bài nói Part 2 & 3 và giải các đề thi Writing khó nhất.");
            course4.setIsDeleted(false);
            courseRepository.save(course4);
        }

        if (existingCourses.stream().noneMatch(c -> c.getTitle().equalsIgnoreCase("Tiếng Anh Thiếu Nhi (Starters & Movers)"))) {
            Course course5 = new Course();
            course5.setTitle("Tiếng Anh Thiếu Nhi (Starters & Movers)");
            course5.setDescription("Khóa học tiếng Anh vui nhộn theo chuẩn quốc tế Cambridge dành cho học sinh tiểu học. Kích thích sự tò mò và yêu thích học tập của trẻ thông qua các hoạt động tương tác sinh động.");
            course5.setLevel("Beginner");
            course5.setCategory("Trẻ em");
            course5.setPrice(new BigDecimal("2800000"));
            course5.setThumbnailUrl("https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=60");
            course5.setSuitableFor("Trẻ em độ tuổi tiểu học (từ 6 - 9 tuổi) bắt đầu xây dựng nền tảng tiếng Anh.");
            course5.setOutputGoals("Giúp bé tự tin giao tiếp các mẫu câu cơ bản và chinh phục tối đa 15 khiên trong các kỳ thi Cambridge Starters/Movers.");
            course5.setDuration("3 tháng (36 buổi)");
            course5.setCommitment("Khơi gợi niềm đam mê ngôn ngữ, giúp trẻ phát âm chuẩn tự nhiên ngay từ đầu.");
            course5.setLearningMethod("Học tập trực quan sinh động qua trò chơi ngôn ngữ, bài hát tiếng Anh trẻ em và tranh vẽ đầy màu sắc.");
            course5.setSyllabus("Tháng 1: Học từ vựng chủ đề gia đình, bạn bè, lớp học. Tháng 2: Khám phá thế giới động vật, đồ chơi và cơ thể người. Tháng 3: Thực hành các đoạn hội thoại giao tiếp ngắn và thi thử Cambridge.");
            course5.setIsDeleted(false);
            courseRepository.save(course5);
        }

        if (existingCourses.stream().noneMatch(c -> c.getTitle().equalsIgnoreCase("Luyện Phát Âm & Ngữ Điệu Chuẩn Mỹ"))) {
            Course course6 = new Course();
            course6.setTitle("Luyện Phát Âm & Ngữ Điệu Chuẩn Mỹ");
            course6.setDescription("Khóa học chuyên sâu giúp sửa đổi triệt để các lỗi phát âm tiếng Anh phổ biến của người Việt. Giúp bạn làm chủ khẩu hình 44 âm IPA, trọng âm từ, nối âm và ngữ điệu câu chuẩn giọng Mỹ.");
            course6.setLevel("Beginner");
            course6.setCategory("Giao tiếp");
            course6.setPrice(new BigDecimal("1800000"));
            course6.setThumbnailUrl("https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&auto=format&fit=crop&q=60");
            course6.setSuitableFor("Tất cả những ai muốn cải thiện giọng nói tiếng Anh, nói trôi chảy dễ nghe và tăng khả năng nghe hiểu.");
            course6.setOutputGoals("Phát âm chuẩn xác bất kỳ từ vựng nào, nói tiếng Anh có ngữ điệu tự nhiên và biểu cảm.");
            course6.setDuration("2 tháng (24 buổi)");
            course6.setCommitment("Cải thiện 80% độ chuẩn xác phát âm và sự tự tin sau khi kết thúc lộ trình học.");
            course6.setLearningMethod("Chỉnh sửa trực quan khẩu hình miệng của từng học viên, ghi âm bài nói hàng ngày để giáo viên nhận xét sửa lỗi.");
            course6.setSyllabus("Tuần 1-4: Luyện tập 44 nguyên âm đơn, nguyên âm đôi và phụ âm trong bảng IPA. Tuần 5-8: Quy tắc nhấn trọng âm, nối âm, nuốt âm và lên giọng/xuống giọng trong giao tiếp thực tế.");
            course6.setIsDeleted(false);
            courseRepository.save(course6);
        }

        if (existingCourses.stream().noneMatch(c -> c.getTitle().equalsIgnoreCase("Tiếng Anh Thương Mại (Business English)"))) {
            Course course7 = new Course();
            course7.setTitle("Tiếng Anh Thương Mại (Business English)");
            course7.setDescription("Khóa học thiết kế chuyên biệt dành cho môi trường công sở. Trang bị đầy đủ từ vựng thương mại, kỹ năng viết email chuyên nghiệp, thuyết trình báo cáo và đàm phán thương thảo lịch thiệp với đối tác.");
            course7.setLevel("Intermediate");
            course7.setCategory("Giao tiếp");
            course7.setPrice(new BigDecimal("3800000"));
            course7.setThumbnailUrl("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60");
            course7.setSuitableFor("Người đi làm, quản lý dự án, hoặc sinh viên chuẩn bị phỏng vấn vào các tập đoàn đa quốc gia.");
            course7.setOutputGoals("Thành thạo giao tiếp tiếng Anh công sở, tự tin làm việc trong môi trường đa văn hóa toàn cầu.");
            course7.setDuration("3 tháng (36 buổi)");
            course7.setCommitment("Giúp học viên sử dụng tiếng Anh văn phòng tự tin và chuyên nghiệp hơn rõ rệt.");
            course7.setLearningMethod("Học qua các tình huống thực tế tại văn phòng (Case studies), thực hành viết email, thuyết trình nhóm.");
            course7.setSyllabus("Tháng 1: Từ vựng thương mại, kỹ năng giao tiếp điện thoại và viết email trang trọng. Tháng 2: Thuyết trình báo cáo tiến độ và đàm phán hợp đồng. Tháng 3: Tổ chức cuộc họp và tiếp đãi khách hàng nước ngoài.");
            course7.setIsDeleted(false);
            courseRepository.save(course7);
        }

        if (existingCourses.stream().noneMatch(c -> c.getTitle().equalsIgnoreCase("TOEFL iBT Chinh Phục 90+"))) {
            Course course8 = new Course();
            course8.setTitle("TOEFL iBT Chinh Phục 90+");
            course8.setDescription("Khóa học rèn luyện toàn diện cả 4 kỹ năng Đọc, Nghe, Nói, Viết của bài thi TOEFL iBT trên máy tính. Cung cấp phương pháp tư duy tích hợp giúp bứt phá điểm số đáp ứng tiêu chuẩn du học.");
            course8.setLevel("Advanced");
            course8.setCategory("TOEFL");
            course8.setPrice(new BigDecimal("7500000"));
            course8.setThumbnailUrl("https://images.unsplash.com/photo-1513258496099-48168024aec0?w=800&auto=format&fit=crop&q=60");
            course8.setSuitableFor("Học sinh, sinh viên chuẩn bị hồ sơ du học Mỹ, Canada hoặc xin học bổng các trường đại học quốc tế.");
            course8.setOutputGoals("Cam kết đầu ra TOEFL iBT đạt 90 điểm trở lên.");
            course8.setDuration("4 tháng (48 buổi)");
            course8.setCommitment("Cam kết hỗ trợ học lại miễn phí hoặc hoàn phí nếu không đạt điểm cam kết.");
            course8.setLearningMethod("Luyện tập trực tiếp trên phần mềm giả lập phòng thi thật, chấm điểm nói/viết chuẩn theo thang điểm của ETS.");
            course8.setSyllabus("Tháng 1-2: Làm quen cấu trúc câu hỏi TOEFL, xây dựng kỹ năng Nghe - Đọc học thuật. Tháng 3-4: Tập trung rèn luyện kỹ năng Nói - Viết tích hợp, giải đề thi thử và nhận phản hồi chi tiết.");
            course8.setIsDeleted(false);
            courseRepository.save(course8);
        }

        // 3. Seed Users (Teachers & Students)
        // Check and seed extra teachers if they do not exist
        if (userRepository.findByUsernameAndIsDeletedFalse("sarahmiller").isEmpty()) {
            System.out.println("   -> Seeding Additional Teachers...");
            
            User teacherSarah = new User();
            teacherSarah.setUsername("sarahmiller");
            teacherSarah.setPassword(HashUtil.hashPassword("teacher123"));
            teacherSarah.setFullName("Sarah Miller");
            teacherSarah.setEmail("sarah.miller@eduenglish.edu.vn");
            teacherSarah.setRole("TEACHER");
            teacherSarah.setPhone("0911223344");
            teacherSarah.setSpecialty("Chuyên Gia Luyện Phát Âm & Giao Tiếp Phản Xạ");
            teacherSarah.setCertificates("TESOL, CELTA, Bachelor of Linguistics (Boston University)");
            teacherSarah.setExperience("6+ năm kinh nghiệm giảng dạy tiếng Anh giao tiếp tại các tổ chức giáo dục quốc tế.");
            teacherSarah.setBio("Cô Sarah mang đến nguồn năng lượng tràn đầy hứng khởi, giúp học viên giải phóng sự e dè và tự tin giao tiếp trôi chảy sau vài buổi học.");
            teacherSarah.setIsFeatured(true);
            teacherSarah.setIsDeleted(false);
            userRepository.save(teacherSarah);

            User teacherJohn = new User();
            teacherJohn.setUsername("johnathanlee");
            teacherJohn.setPassword(HashUtil.hashPassword("teacher123"));
            teacherJohn.setFullName("Johnathan Lee");
            teacherJohn.setEmail("johnathan.lee@eduenglish.edu.vn");
            teacherJohn.setRole("TEACHER");
            teacherJohn.setPhone("0911223355");
            teacherJohn.setSpecialty("Chuyên Gia Luyện Thi TOEIC 900+ & Tiếng Anh Thương Mại");
            teacherJohn.setCertificates("TOEIC 990/990, TESOL Certified, Master of Education");
            teacherJohn.setExperience("5+ năm kinh nghiệm ôn thi TOEIC cấp tốc và đào tạo tiếng Anh doanh nghiệp.");
            teacherJohn.setBio("Thầy John nổi tiếng với các phương pháp giải đề cực nhanh và sơ đồ tư duy từ vựng độc quyền giúp nâng điểm số TOEIC vượt mong đợi.");
            teacherJohn.setIsFeatured(true);
            teacherJohn.setIsDeleted(false);
            userRepository.save(teacherJohn);
        }

        // Check and seed extra students
        if (userRepository.findByUsernameAndIsDeletedFalse("nguyennam").isEmpty()) {
            System.out.println("   -> Seeding Additional Students...");

            User studentNam = new User();
            studentNam.setUsername("nguyennam");
            studentNam.setPassword(HashUtil.hashPassword("student123"));
            studentNam.setFullName("Nguyễn Hoàng Nam");
            studentNam.setEmail("hoangnam@gmail.com");
            studentNam.setRole("STUDENT");
            studentNam.setPhone("0981112222");
            studentNam.setCurrentStreak(5);
            studentNam.setLongestStreak(12);
            studentNam.setLastActiveDate(LocalDate.now());
            studentNam.setIsDeleted(false);
            userRepository.save(studentNam);

            User studentMai = new User();
            studentMai.setUsername("tranmai");
            studentMai.setPassword(HashUtil.hashPassword("student123"));
            studentMai.setFullName("Trần Thị Mai");
            studentMai.setEmail("tranmai@gmail.com");
            studentMai.setRole("STUDENT");
            studentMai.setPhone("0981113333");
            studentMai.setCurrentStreak(8);
            studentMai.setLongestStreak(15);
            studentMai.setLastActiveDate(LocalDate.now());
            studentMai.setIsDeleted(false);
            userRepository.save(studentMai);

            User studentTriet = new User();
            studentTriet.setUsername("leminhtriet");
            studentTriet.setPassword(HashUtil.hashPassword("student123"));
            studentTriet.setFullName("Lê Minh Triết");
            studentTriet.setEmail("minhtriet@gmail.com");
            studentTriet.setRole("STUDENT");
            studentTriet.setPhone("0981114444");
            studentTriet.setCurrentStreak(2);
            studentTriet.setLongestStreak(6);
            studentTriet.setLastActiveDate(LocalDate.now().minusDays(1));
            studentTriet.setIsDeleted(false);
            userRepository.save(studentTriet);

            User studentLinh = new User();
            studentLinh.setUsername("phamthuylinh");
            studentLinh.setPassword(HashUtil.hashPassword("student123"));
            studentLinh.setFullName("Phạm Thùy Linh");
            studentLinh.setEmail("thuylinh@gmail.com");
            studentLinh.setRole("STUDENT");
            studentLinh.setPhone("0981115555");
            studentLinh.setCurrentStreak(0);
            studentLinh.setLongestStreak(4);
            studentLinh.setLastActiveDate(LocalDate.now().minusDays(3));
            studentLinh.setIsDeleted(false);
            userRepository.save(studentLinh);
        }

        // 4. Seed Classrooms & Enrollments
        if (classroomRepository.count() == 0) {
            System.out.println("   -> Seeding Classrooms & Enrollments...");

            // Fetch references
            Course ieltsCourse = courseRepository.findAll().stream().filter(c -> c.getTitle().contains("IELTS")).findFirst().orElse(null);
            Course toeicCourse = courseRepository.findAll().stream().filter(c -> c.getTitle().contains("TOEIC")).findFirst().orElse(null);
            Course commCourse = courseRepository.findAll().stream().filter(c -> c.getTitle().contains("Giao Tiếp")).findFirst().orElse(null);

            User teacherDavid = userRepository.findByUsernameAndIsDeletedFalse("teacher").orElse(null);
            User teacherSarah = userRepository.findByUsernameAndIsDeletedFalse("sarahmiller").orElse(null);
            User teacherJohn = userRepository.findByUsernameAndIsDeletedFalse("johnathanlee").orElse(null);

            User mainStudent = userRepository.findByUsernameAndIsDeletedFalse("student").orElse(null);
            User studentNam = userRepository.findByUsernameAndIsDeletedFalse("nguyennam").orElse(null);
            User studentMai = userRepository.findByUsernameAndIsDeletedFalse("tranmai").orElse(null);
            User studentTriet = userRepository.findByUsernameAndIsDeletedFalse("leminhtriet").orElse(null);
            User studentLinh = userRepository.findByUsernameAndIsDeletedFalse("phamthuylinh").orElse(null);

            if (ieltsCourse != null && teacherDavid != null) {
                Classroom ieltsClass = new Classroom();
                ieltsClass.setClassName("IELTS-6.5-K10");
                ieltsClass.setCourseId(ieltsCourse.getId());
                ieltsClass.setTeacherId(teacherDavid.getId());
                ieltsClass.setSchedule("Thứ 2, 4, 6 | 18:00 - 20:00");
                ieltsClass.setSemester("Hè 2026");
                ieltsClass.setTuitionFee(ieltsCourse.getPrice());
                ieltsClass.setIsDeleted(false);
                Classroom savedIelts = classroomRepository.save(ieltsClass);

                // Enroll students to IELTS
                if (mainStudent != null) {
                    ClassEnrollment enr1 = new ClassEnrollment();
                    enr1.setClassId(savedIelts.getId());
                    enr1.setStudentId(mainStudent.getId());
                    enr1.setGrade(new BigDecimal("8.50"));
                    classEnrollmentRepository.save(enr1);
                }
                if (studentNam != null) {
                    ClassEnrollment enr2 = new ClassEnrollment();
                    enr2.setClassId(savedIelts.getId());
                    enr2.setStudentId(studentNam.getId());
                    enr2.setGrade(new BigDecimal("7.00"));
                    classEnrollmentRepository.save(enr2);
                }
                if (studentMai != null) {
                    ClassEnrollment enr3 = new ClassEnrollment();
                    enr3.setClassId(savedIelts.getId());
                    enr3.setStudentId(studentMai.getId());
                    enr3.setGrade(new BigDecimal("9.00"));
                    classEnrollmentRepository.save(enr3);
                }
            }

            if (toeicCourse != null && teacherJohn != null) {
                Classroom toeicClass = new Classroom();
                toeicClass.setClassName("TOEIC-750-K08");
                toeicClass.setCourseId(toeicCourse.getId());
                toeicClass.setTeacherId(teacherJohn.getId());
                toeicClass.setSchedule("Thứ 3, 5 | 19:30 - 21:30");
                toeicClass.setSemester("Hè 2026");
                toeicClass.setTuitionFee(toeicCourse.getPrice());
                toeicClass.setIsDeleted(false);
                Classroom savedToeic = classroomRepository.save(toeicClass);

                // Enroll students to TOEIC
                if (mainStudent != null) {
                    ClassEnrollment enr1 = new ClassEnrollment();
                    enr1.setClassId(savedToeic.getId());
                    enr1.setStudentId(mainStudent.getId());
                    enr1.setGrade(new BigDecimal("8.00"));
                    classEnrollmentRepository.save(enr1);
                }
                if (studentTriet != null) {
                    ClassEnrollment enr2 = new ClassEnrollment();
                    enr2.setClassId(savedToeic.getId());
                    enr2.setStudentId(studentTriet.getId());
                    enr2.setGrade(new BigDecimal("6.50"));
                    classEnrollmentRepository.save(enr2);
                }
                if (studentLinh != null) {
                    ClassEnrollment enr3 = new ClassEnrollment();
                    enr3.setClassId(savedToeic.getId());
                    enr3.setStudentId(studentLinh.getId());
                    enr3.setGrade(new BigDecimal("9.50"));
                    classEnrollmentRepository.save(enr3);
                }
            }

            if (commCourse != null && teacherSarah != null) {
                Classroom commClass = new Classroom();
                commClass.setClassName("COMM-GiaoTiep-K12");
                commClass.setCourseId(commCourse.getId());
                commClass.setTeacherId(teacherSarah.getId());
                commClass.setSchedule("Thứ 7, Chủ Nhật | 09:00 - 11:00");
                commClass.setSemester("Hè 2026");
                commClass.setTuitionFee(commCourse.getPrice());
                commClass.setIsDeleted(false);
                Classroom savedComm = classroomRepository.save(commClass);

                // Enroll students to Communication
                if (mainStudent != null) {
                    ClassEnrollment enr1 = new ClassEnrollment();
                    enr1.setClassId(savedComm.getId());
                    enr1.setStudentId(mainStudent.getId());
                    enr1.setGrade(new BigDecimal("9.00"));
                    classEnrollmentRepository.save(enr1);
                }
                if (studentNam != null) {
                    ClassEnrollment enr2 = new ClassEnrollment();
                    enr2.setClassId(savedComm.getId());
                    enr2.setStudentId(studentNam.getId());
                    enr2.setGrade(new BigDecimal("7.50"));
                    classEnrollmentRepository.save(enr2);
                }
                if (studentLinh != null) {
                    ClassEnrollment enr3 = new ClassEnrollment();
                    enr3.setClassId(savedComm.getId());
                    enr3.setStudentId(studentLinh.getId());
                    enr3.setGrade(new BigDecimal("8.50"));
                    classEnrollmentRepository.save(enr3);
                }
            }
        }

        // 5. Seed Course Materials
        if (courseMaterialRepository.count() == 0) {
            System.out.println("   -> Seeding Course Materials...");

            Course ieltsCourse = courseRepository.findAll().stream().filter(c -> c.getTitle().contains("IELTS")).findFirst().orElse(null);
            Course toeicCourse = courseRepository.findAll().stream().filter(c -> c.getTitle().contains("TOEIC")).findFirst().orElse(null);

            if (ieltsCourse != null) {
                CourseMaterial m1 = new CourseMaterial();
                m1.setCourseId(ieltsCourse.getId());
                m1.setTitle("IELTS Grammar in Use (Essential Edition)");
                m1.setDescription("Tổng hợp kiến thức ngữ pháp cốt lõi phục vụ viết luận và làm bài đọc hiểu IELTS.");
                m1.setType("DOCUMENT");
                m1.setFileUrl("/uploads/materials/grammar_in_use.pdf");
                m1.setIsDeleted(false);
                courseMaterialRepository.save(m1);

                CourseMaterial m2 = new CourseMaterial();
                m2.setCourseId(ieltsCourse.getId());
                m2.setTitle("Bộ 10 Đề IELTS Listening Trọng Tâm 2026");
                m2.setDescription("Các bài nghe chọn lọc sát đề thi thật gần đây kèm theo PDF Scripts chi tiết.");
                m2.setType("AUDIO");
                m2.setFileUrl("/uploads/materials/listening_test_2026.zip");
                m2.setIsDeleted(false);
                courseMaterialRepository.save(m2);
            }

            if (toeicCourse != null) {
                CourseMaterial m3 = new CourseMaterial();
                m3.setCourseId(toeicCourse.getId());
                m3.setTitle("600 Từ Vựng TOEIC Vàng Phải Biết");
                m3.setDescription("Hệ thống từ vựng thông dụng chia theo các chủ đề hợp đồng, marketing, đàm phán kinh doanh.");
                m3.setType("DOCUMENT");
                m3.setFileUrl("/uploads/materials/toeic_vocab_600.pdf");
                m3.setIsDeleted(false);
                courseMaterialRepository.save(m3);
            }
        }

        // 6. Seed Course Activities, Questions, Submissions, and Answers
        if (courseActivityRepository.count() == 0) {
            System.out.println("   -> Seeding Course Activities, Questions, and Submissions...");

            Course ieltsCourse = courseRepository.findAll().stream().filter(c -> c.getTitle().contains("IELTS")).findFirst().orElse(null);
            User mainStudent = userRepository.findByUsernameAndIsDeletedFalse("student").orElse(null);
            User studentNam = userRepository.findByUsernameAndIsDeletedFalse("nguyennam").orElse(null);
            User studentMai = userRepository.findByUsernameAndIsDeletedFalse("tranmai").orElse(null);

            if (ieltsCourse != null) {
                // Activity 1: Listening Homework
                CourseActivity act1 = new CourseActivity();
                act1.setCourseId(ieltsCourse.getId());
                act1.setTitle("Bài Luyện Tập Listening - Unit 1: Daily Conversations");
                act1.setType("HOMEWORK");
                act1.setSkill("LISTENING");
                act1.setInstruction("Hãy lắng nghe audio hội thoại ngắn dưới đây và trả lời hai câu hỏi trắc nghiệm.");
                act1.setAudioUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
                act1.setIsResultsReleased(true);
                act1.setIsDeleted(false);
                CourseActivity savedAct1 = courseActivityRepository.save(act1);

                // Add questions for Activity 1
                ActivityQuestion q1 = new ActivityQuestion();
                q1.setActivityId(savedAct1.getId());
                q1.setQuestionNumber(1);
                q1.setQuestionText("What is the primary topic of the phone call?");
                q1.setQuestionType("MULTIPLE_CHOICE");
                q1.setOptions("A. Rescheduling a meeting|B. Booking a hotel room|C. Canceling a flight ticket|D. Asking for restaurant recommendations");
                q1.setCorrectAnswer("B");
                ActivityQuestion savedQ1 = activityQuestionRepository.save(q1);

                ActivityQuestion q2 = new ActivityQuestion();
                q2.setActivityId(savedAct1.getId());
                q2.setQuestionNumber(2);
                q2.setQuestionText("On which day will the caller arrive at the destination?");
                q2.setQuestionType("MULTIPLE_CHOICE");
                q2.setOptions("A. Next Monday|B. Next Wednesday|C. This Saturday|D. This Sunday");
                q2.setCorrectAnswer("C");
                ActivityQuestion savedQ2 = activityQuestionRepository.save(q2);

                // Mock Submissions for Activity 1
                if (mainStudent != null) {
                    StudentSubmission sub1 = new StudentSubmission();
                    sub1.setActivityId(savedAct1.getId());
                    sub1.setStudentId(mainStudent.getId());
                    sub1.setScore(10.0);
                    sub1.setIsGraded(true);
                    StudentSubmission savedSub1 = studentSubmissionRepository.save(sub1);

                    // Answers for student 1
                    SubmissionAnswer ans1 = new SubmissionAnswer();
                    ans1.setSubmissionId(savedSub1.getId());
                    ans1.setQuestionId(savedQ1.getId());
                    ans1.setStudentAnswer("B");
                    submissionAnswerRepository.save(ans1);

                    SubmissionAnswer ans2 = new SubmissionAnswer();
                    ans2.setSubmissionId(savedSub1.getId());
                    ans2.setQuestionId(savedQ2.getId());
                    ans2.setStudentAnswer("C");
                    submissionAnswerRepository.save(ans2);
                }

                if (studentNam != null) {
                    StudentSubmission sub2 = new StudentSubmission();
                    sub2.setActivityId(savedAct1.getId());
                    sub2.setStudentId(studentNam.getId());
                    sub2.setScore(5.0);
                    sub2.setIsGraded(true);
                    StudentSubmission savedSub2 = studentSubmissionRepository.save(sub2);

                    // Answers for student Nam (1 correct, 1 wrong)
                    SubmissionAnswer ans1 = new SubmissionAnswer();
                    ans1.setSubmissionId(savedSub2.getId());
                    ans1.setQuestionId(savedQ1.getId());
                    ans1.setStudentAnswer("B"); // correct
                    submissionAnswerRepository.save(ans1);

                    SubmissionAnswer ans2 = new SubmissionAnswer();
                    ans2.setSubmissionId(savedSub2.getId());
                    ans2.setQuestionId(savedQ2.getId());
                    ans2.setStudentAnswer("A"); // wrong
                    submissionAnswerRepository.save(ans2);
                }

                if (studentMai != null) {
                    StudentSubmission sub3 = new StudentSubmission();
                    sub3.setActivityId(savedAct1.getId());
                    sub3.setStudentId(studentMai.getId());
                    sub3.setScore(10.0);
                    sub3.setIsGraded(true);
                    StudentSubmission savedSub3 = studentSubmissionRepository.save(sub3);

                    // Answers for student Mai
                    SubmissionAnswer ans1 = new SubmissionAnswer();
                    ans1.setSubmissionId(savedSub3.getId());
                    ans1.setQuestionId(savedQ1.getId());
                    ans1.setStudentAnswer("B");
                    submissionAnswerRepository.save(ans1);

                    SubmissionAnswer ans2 = new SubmissionAnswer();
                    ans2.setSubmissionId(savedSub3.getId());
                    ans2.setQuestionId(savedQ2.getId());
                    ans2.setStudentAnswer("C");
                    submissionAnswerRepository.save(ans2);
                }

                // Activity 2: Reading Test
                CourseActivity act2 = new CourseActivity();
                act2.setCourseId(ieltsCourse.getId());
                act2.setTitle("Kiểm Tra Giữa Kỳ - Reading Comprehension & Writing Essay");
                act2.setType("TEST");
                act2.setSkill("READING");
                act2.setInstruction("Đọc đoạn văn bản học thuật và hoàn thành bài thi. Câu 2 yêu cầu viết đoạn văn ngắn, giáo viên chấm điểm thủ công.");
                act2.setIsResultsReleased(true);
                act2.setIsDeleted(false);
                CourseActivity savedAct2 = courseActivityRepository.save(act2);

                ActivityQuestion q3 = new ActivityQuestion();
                q3.setActivityId(savedAct2.getId());
                q3.setQuestionNumber(1);
                q3.setQuestionText("Write the missing word: The process of plants making food using sunlight is called ________.");
                q3.setQuestionType("FILL_IN_THE_BLANK");
                q3.setOptions("");
                q3.setCorrectAnswer("photosynthesis");
                ActivityQuestion savedQ3 = activityQuestionRepository.save(q3);

                ActivityQuestion q4 = new ActivityQuestion();
                q4.setActivityId(savedAct2.getId());
                q4.setQuestionNumber(2);
                q4.setQuestionText("Briefly explain the advantages of working from home (50-100 words).");
                q4.setQuestionType("TEXT_RESPONSE");
                q4.setOptions("");
                q4.setCorrectAnswer("");
                ActivityQuestion savedQ4 = activityQuestionRepository.save(q4);

                // Mock Submissions for Activity 2
                if (mainStudent != null) {
                    StudentSubmission subTest1 = new StudentSubmission();
                    subTest1.setActivityId(savedAct2.getId());
                    subTest1.setStudentId(mainStudent.getId());
                    subTest1.setScore(9.0);
                    subTest1.setIsGraded(true);
                    subTest1.setTeacherFeedback("Bài làm viết luận rất hay, lập luận mạch lạc, dùng từ vựng linh hoạt.");
                    StudentSubmission savedSubTest1 = studentSubmissionRepository.save(subTest1);

                    SubmissionAnswer ans1 = new SubmissionAnswer();
                    ans1.setSubmissionId(savedSubTest1.getId());
                    ans1.setQuestionId(savedQ3.getId());
                    ans1.setStudentAnswer("photosynthesis");
                    submissionAnswerRepository.save(ans1);

                    SubmissionAnswer ans2 = new SubmissionAnswer();
                    ans2.setSubmissionId(savedSubTest1.getId());
                    ans2.setQuestionId(savedQ4.getId());
                    ans2.setStudentAnswer("Working from home offers flexibility, allowing employees to manage their schedule better. It also eliminates the daily commute, saving both time and money, which increases overall productivity.");
                    submissionAnswerRepository.save(ans2);
                }

                if (studentNam != null) {
                    StudentSubmission subTest2 = new StudentSubmission();
                    subTest2.setActivityId(savedAct2.getId());
                    subTest2.setStudentId(studentNam.getId());
                    subTest2.setScore(7.0);
                    subTest2.setIsGraded(true);
                    subTest2.setTeacherFeedback("Cấu trúc viết luận cần rõ ràng hơn, sửa một số lỗi chính tả nhỏ.");
                    StudentSubmission savedSubTest2 = studentSubmissionRepository.save(subTest2);

                    SubmissionAnswer ans1 = new SubmissionAnswer();
                    ans1.setSubmissionId(savedSubTest2.getId());
                    ans1.setQuestionId(savedQ3.getId());
                    ans1.setStudentAnswer("photosynthesis");
                    submissionAnswerRepository.save(ans1);

                    SubmissionAnswer ans2 = new SubmissionAnswer();
                    ans2.setSubmissionId(savedSubTest2.getId());
                    ans2.setQuestionId(savedQ4.getId());
                    ans2.setStudentAnswer("Working at home is good because we have free time. We don't need to drive to the office. So we can work relax.");
                    submissionAnswerRepository.save(ans2);
                }
            }
        }

        // 7. Seed Student Badges
        if (studentBadgeRepository.count() == 0) {
            System.out.println("   -> Seeding Student Badges...");
            User mainStudent = userRepository.findByUsernameAndIsDeletedFalse("student").orElse(null);
            User studentNam = userRepository.findByUsernameAndIsDeletedFalse("nguyennam").orElse(null);
            User studentMai = userRepository.findByUsernameAndIsDeletedFalse("tranmai").orElse(null);

            if (mainStudent != null) {
                StudentBadge b1 = new StudentBadge();
                b1.setStudentId(mainStudent.getId());
                b1.setBadgeKey("STREAK_3");
                studentBadgeRepository.save(b1);

                StudentBadge b2 = new StudentBadge();
                b2.setStudentId(mainStudent.getId());
                b2.setBadgeKey("FIRST_SUBMISSION");
                studentBadgeRepository.save(b2);

                StudentBadge b3 = new StudentBadge();
                b3.setStudentId(mainStudent.getId());
                b3.setBadgeKey("PERFECT_SCORE");
                studentBadgeRepository.save(b3);
            }

            if (studentNam != null) {
                StudentBadge b1 = new StudentBadge();
                b1.setStudentId(studentNam.getId());
                b1.setBadgeKey("FIRST_SUBMISSION");
                studentBadgeRepository.save(b1);

                StudentBadge b2 = new StudentBadge();
                b2.setStudentId(studentNam.getId());
                b2.setBadgeKey("STREAK_3");
                studentBadgeRepository.save(b2);
            }

            if (studentMai != null) {
                StudentBadge b1 = new StudentBadge();
                b1.setStudentId(studentMai.getId());
                b1.setBadgeKey("FIRST_SUBMISSION");
                studentBadgeRepository.save(b1);

                StudentBadge b2 = new StudentBadge();
                b2.setStudentId(studentMai.getId());
                b2.setBadgeKey("PERFECT_SCORE");
                studentBadgeRepository.save(b2);

                StudentBadge b3 = new StudentBadge();
                b3.setStudentId(studentMai.getId());
                b3.setBadgeKey("STREAK_7");
                studentBadgeRepository.save(b3);
            }
        }

        // 8. Seed Blog Posts (Additional)
        System.out.println("   -> Checking and Seeding Blog Posts...");
        List<BlogPost> existingBlogs = blogPostRepository.findAll();

        if (existingBlogs.stream().noneMatch(b -> b.getTitle().equalsIgnoreCase("Lộ trình tự học TOEIC 750+ từ con số 0 cực hiệu quả trong 4 tháng"))) {
            BlogPost post2 = new BlogPost();
            post2.setTitle("Lộ trình tự học TOEIC 750+ từ con số 0 cực hiệu quả trong 4 tháng");
            post2.setSlug("lo-trinh-tu-hoc-toeic-750-tu-con-so-0-cuc-hieu-qua-trong-4-thang");
            post2.setSummary("Đạt điểm cao TOEIC không hề khó nếu bạn biết phân chia lộ trình ôn luyện rõ ràng. Cần chú trọng phương pháp nhớ từ vựng thương mại theo cụm và làm quen với cấu trúc đề thi nghe đọc TOEIC Format mới nhất.");
            post2.setContent(
                "<h2>Giai đoạn 1: Lấy lại gốc ngữ pháp và từ vựng cơ bản (Tháng 1)</h2>\n" +
                "<p>Thời gian đầu bạn nên ôn lại các thì cơ bản (Simple, Continuous, Perfect), câu bị động, mệnh đề quan hệ và các cấu trúc so sánh thường gặp. Từ vựng hãy tích lũy thông qua 12 chủ điểm thương mại chính như Contracting, Marketing, Shipping, Purchasing...</p>\n" +
                "<h2>Giai đoạn 2: Luyện kỹ năng và mẹo làm bài Part 1-7 (Tháng 2 - 3)</h2>\n" +
                "<p>Học cách làm nhanh Part 5 & 6 bằng phương pháp phân tích nhanh từ loại. Luyện nghe Part 2 bằng cách bắt từ khóa (Who, When, Where). Đối với Part 7, rèn luyện kỹ năng đọc lướt và trả lời câu hỏi theo trình tự xuất hiện trong bài đọc.</p>\n" +
                "<h2>Giai đoạn 3: Giải đề thực tế áp lực thời gian (Tháng 4)</h2>\n" +
                "<p>Mỗi ngày hãy bấm giờ làm trọn vẹn 1 đề thi thử ETS. Sau khi chấm điểm, việc ghi chú phân tích lại lỗi sai là yếu tố quyết định nâng band điểm vượt bậc của bạn.</p>"
            );
            post2.setFaq(
                "[\n" +
                "  {\"q\": \"Nên dùng tài liệu nào để luyện đề TOEIC?\", \"a\": \"Bộ đề ETS TOEIC Test là bộ tài liệu chuẩn hóa và sát với đề thi thật nhất hiện nay.\"},\n" +
                "  {\"q\": \"Bị ngợp thời gian khi làm Part 7 thì làm sao?\", \"a\": \"Hãy rèn luyện kỹ năng giới hạn thời gian: tối đa 1 phút cho mỗi câu hỏi đọc hiểu.\"}\n" +
                "]"
            );
            post2.setCtaText("Nhận đề thi thử TOEIC ETS sát đề thi thật 2026 miễn phí");
            post2.setCtaLink("#register-section");
            post2.setThumbnailUrl("https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60");
            post2.setIsDeleted(false);
            blogPostRepository.save(post2);
        }

        if (existingBlogs.stream().noneMatch(b -> b.getTitle().equalsIgnoreCase("Top 5 phương pháp luyện nói tiếng Anh trôi chảy và tự nhiên tại nhà"))) {
            BlogPost post3 = new BlogPost();
            post3.setTitle("Top 5 phương pháp luyện nói tiếng Anh trôi chảy và tự nhiên tại nhà");
            post3.setSlug("top-5-phuong-phap-luyen-noi-tieng-anh-troi-chay-va-tu-nhien-tai-nha");
            post3.setSummary("Luyện phát âm chuẩn kết hợp với phương pháp Shadowing (bắt chước) và luyện nói trước gương là những cách thức cực kỳ hiệu quả để cải thiện khả năng giao tiếp phản xạ tự nhiên của bạn.");
            post3.setContent(
                "<h2>1. Làm quen và chuẩn hóa ngữ âm IPA</h2>\n" +
                "<p>Phát âm đúng từng âm đơn lẻ là bước đầu tiên để nói hay. Hãy luyện tập đều đặn 44 âm quốc tế IPA, đặc biệt chú ý đến âm đuôi (ending sounds) và cách nối âm đặc trưng của tiếng Anh.</p>\n" +
                "<h2>2. Ứng dụng phương pháp Shadowing (Nhại giọng)</h2>\n" +
                "<p>Hãy chọn một đoạn audio/video ngắn từ người bản xứ nói, sau đó bật lên và cố gắng nói đuổi theo, bắt chước giống 100% ngữ điệu, nhấn nhá, ngắt nghỉ của họ. Đây là bí quyết cốt lõi để nói tiếng Anh có nhạc điệu tự nhiên.</p>\n" +
                "<h2>3. Tập suy nghĩ trực tiếp bằng tiếng Anh</h2>\n" +
                "<p>Đừng dịch từ tiếng Việt sang tiếng Anh trong đầu trước khi nói. Hãy tập đặt tên cho các đồ vật xung quanh và tự mô tả hoạt động của mình bằng các câu ngắn tiếng Anh đơn giản để xây dựng tư duy phản xạ không điều kiện.</p>"
            );
            post3.setFaq(
                "[\n" +
                "  {\"q\": \"Làm sao để sửa giọng nói đỡ thô cứng?\", \"a\": \"Lắng nghe giọng đọc của mình bằng cách ghi âm lại khi nói, đối chiếu với người bản xứ để tìm ra lỗi sai và chỉnh sửa.\"}\n" +
                "]"
            );
            post3.setCtaText("Đăng ký kiểm tra trình độ giao tiếp phản xạ miễn phí");
            post3.setCtaLink("#register-section");
            post3.setThumbnailUrl("https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=60");
            post3.setIsDeleted(false);
            blogPostRepository.save(post3);
        }

        if (existingBlogs.stream().noneMatch(b -> b.getTitle().equalsIgnoreCase("Bí quyết chinh phục 8.0 IELTS Listening bằng phương pháp nghe chép chính tả"))) {
            BlogPost post4 = new BlogPost();
            post4.setTitle("Bí quyết chinh phục 8.0 IELTS Listening bằng phương pháp nghe chép chính tả");
            post4.setSlug("bi-quyet-chinh-phuc-8.0-ielts-listening-bang-phuong-phap-nghe-chep-chinh-ta");
            post4.setSummary("Nghe chép chính tả (Dictation) là phương pháp tối ưu giúp bạn sửa lỗi bỏ sót âm đuôi, phát hiện các từ đồng âm và tăng tốc độ xử lý thông tin nhạy bén khi làm bài thi nghe.");
            post4.setContent(
                "<h2>Tại sao bạn nghe mãi nhưng không tăng band điểm?</h2>\n" +
                "<p>Vấn đề lớn nhất của người học là nghe hiểu ý chung nhưng lại viết sai từ loại, thiếu đuôi '-s' hoặc '-ed', hoặc bị lỡ thông tin khi bài nghe tăng tốc. Phương pháp nghe chép chính tả buộc não bộ của bạn phải hoạt động tập trung 100% để ghi nhận từng chi tiết âm thanh nhỏ nhất.</p>\n" +
                "<h2>3 bước luyện nghe chép chính tả đạt hiệu quả tối đa</h2>\n" +
                "<p><b>Bước 1: Nghe và chép lại.</b> Chọn đoạn nghe từ 2-3 phút phù hợp với trình độ, bật và dừng sau mỗi câu để ghi lại chính xác những gì bạn nghe được. Chấp nhận các khoảng trống nếu chưa nghe ra.</p>\n" +
                "<p><b>Bước 2: So sánh với Transcript.</b> Dùng bút đỏ sửa các lỗi sai chính tả, lỗi ngữ pháp hoặc những chỗ nghe nhầm từ. Đây chính là bước giúp bạn nhận ra điểm yếu về ngữ âm của mình.</p>\n" +
                "<p><b>Bước 3: Nghe lại và nhại giọng.</b> Vừa nhìn transcript vừa nghe lại đoạn audio, tập trung vào những chỗ đã sửa sai để ghi nhớ từ vựng và cách nối âm.</p>"
            );
            post4.setFaq(
                "[\n" +
                "  {\"q\": \"Nên dùng nguồn nghe nào để chép chính tả?\", \"a\": \"Với IELTS, bạn nên dùng chính các đoạn hội thoại ngắn Section 1 & 2 trong bộ đề Cam để chép chính tả.\"}\n" +
                "]"
            );
            post4.setCtaText("Tải ngay danh sách 50 chủ đề nghe chép chính tả IELTS chọn lọc");
            post4.setCtaLink("#register-section");
            post4.setThumbnailUrl("https://images.unsplash.com/photo-1484807352052-23338990c6c6?w=800&auto=format&fit=crop&q=60");
            post4.setIsDeleted(false);
            blogPostRepository.save(post4);
        }

        if (existingBlogs.stream().noneMatch(b -> b.getTitle().equalsIgnoreCase("Phân biệt nhanh 12 thì trong tiếng Anh và mẹo ghi nhớ siêu tốc"))) {
            BlogPost post5 = new BlogPost();
            post5.setTitle("Phân biệt nhanh 12 thì trong tiếng Anh và mẹo ghi nhớ siêu tốc");
            post5.setSlug("phan-biet-nhanh-12-thi-trong-tieng-anh-va-meo-ghi-nho-sieu-toc-qua-so-do-tu-duy");
            post5.setSummary("Học ngữ pháp không cần học vẹt công thức khô khan. Hãy nhóm các thì theo dòng thời gian (Quá khứ, Hiện tại, Tương lai) và làm chủ bản chất sử dụng của chúng để ghi nhớ lâu dài.");
            post5.setContent(
                "<h2>Bản chất thực sự của các thì tiếng Anh</h2>\n" +
                "<p>12 thì tiếng Anh thực chất được xây dựng dựa trên sự giao thoa giữa 3 mốc thời gian (Quá khứ, Hiện tại, Tương lai) và 4 trạng thái hành động (Đơn giản, Tiếp diễn, Hoàn thành, Hoàn thành tiếp diễn).</p>\n" +
                "<h2>Mẹo phân biệt nhanh qua nhóm trạng thái</h2>\n" +
                "<p><b>Nhóm Tiếp diễn (Continuous):</b> Luôn diễn tả hành động đang xảy ra tại một thời điểm xác định, công thức luôn có dạng <i>'to be + V-ing'</i>.</p>\n" +
                "<p><b>Nhóm Hoàn thành (Perfect):</b> Luôn diễn tả mối liên hệ giữa hai thời điểm khác nhau, hoặc hành động đã kết thúc trước một thời điểm khác, công thức luôn có dạng <i>'have/has/had + V3/ed'</i>.</p>\n" +
                "<p><b>Nhóm Hoàn thành tiếp diễn:</b> Nhấn mạnh tính liên tục và kéo dài của hành động kết nối hai khoảng thời gian.</p>"
            );
            post5.setFaq(
                "[\n" +
                "  {\"q\": \"Thì nào hay xuất hiện nhất trong giao tiếp?\", \"a\": \"Thì hiện tại đơn, quá khứ đơn, tương lai đơn và hiện tại hoàn thành chiếm hơn 80% tần suất giao tiếp hàng ngày.\"}\n" +
                "]"
            );
            post5.setCtaText("Tải Sơ đồ tư duy 12 thì tiếng Anh PDF thiết kế độc quyền");
            post5.setCtaLink("#register-section");
            post5.setThumbnailUrl("https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=60");
            post5.setIsDeleted(false);
            blogPostRepository.save(post5);
        }

        if (existingBlogs.stream().noneMatch(b -> b.getTitle().equalsIgnoreCase("Hướng dẫn viết email thương mại chuyên nghiệp dành cho người đi làm"))) {
            BlogPost post6 = new BlogPost();
            post6.setTitle("Hướng dẫn viết email thương mại chuyên nghiệp dành cho người đi làm");
            post6.setSlug("huong-dan-viet-email-thuong-mai-chuyen-nghiep-danh-cho-nguoi-di-lam");
            post6.setSummary("Viết email tiếng Anh công sở lịch thiệp, súc tích là kỹ năng vô cùng quan trọng. Hãy bỏ túi ngay các quy tắc mở đầu, trình bày nội dung và các mẫu câu thông dụng khi trao đổi với đối tác.");
            post6.setContent(
                "<h2>Cấu trúc chuẩn của một Email công việc</h2>\n" +
                "<p>Một email chuyên nghiệp luôn gồm 5 phần chính: Dòng chủ đề (Subject Line), Lời chào hỏi (Salutation), Lý do viết thư (Reason for writing), Nội dung chi tiết & Đề xuất (Details & Call to action), Lời chúc kết thúc (Sign-off).</p>\n" +
                "<h2>Các mẫu câu vàng lịch thiệp trong công sở</h2>\n" +
                "<p><b>Đưa ra phản hồi nhanh:</b> \"Thank you for your prompt response...\" (Cảm ơn bạn đã phản hồi nhanh chóng).</p>\n" +
                "<p><b>Đính kèm tài liệu:</b> \"Please find attached the report for...\" (Vui lòng tìm file đính kèm báo cáo về...).</p>\n" +
                "<p><b>Nhắc nhở nhẹ nhàng:</b> \"I would like to gently remind you about...\" (Tôi muốn nhắc nhẹ bạn về...).</p>\n" +
                "<p><b>Kết thúc email chuyên nghiệp:</b> \"Best regards,\" hoặc \"Sincerely,\" (Trân trọng/Kính thư).</p>"
            );
            post6.setFaq(
                "[\n" +
                "  {\"q\": \"Subject Line nên viết thế nào?\", \"a\": \"Luôn ngắn gọn, trực diện và chứa từ khóa chính (Ví dụ: [Reminder] Meeting Agenda - 10 Oct).\"}\n" +
                "]"
            );
            post6.setCtaText("Nhận Ebook 100 mẫu email tiếng Anh công sở thông dụng");
            post6.setCtaLink("#register-section");
            post6.setThumbnailUrl("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60");
            post6.setIsDeleted(false);
            blogPostRepository.save(post6);
        }

        if (existingBlogs.stream().noneMatch(b -> b.getTitle().equalsIgnoreCase("Trẻ em nên học tiếng Anh từ mấy tuổi để phát triển ngôn ngữ tự nhiên?"))) {
            BlogPost post7 = new BlogPost();
            post7.setTitle("Trẻ em nên học tiếng Anh từ mấy tuổi để phát triển ngôn ngữ tự nhiên?");
            post7.setSlug("tre-em-nen-hoc-tieng-anh-tu-may-tuoi-de-phat-trien-ngon-ngu-tu-nhien");
            post7.setSummary("Các nghiên cứu ngôn ngữ học chỉ ra rằng độ tuổi từ 3 đến 6 tuổi là 'giai đoạn vàng' giúp trẻ em tiếp nhận ngôn ngữ thứ hai một cách tự nhiên và phát âm chuẩn xác như tiếng mẹ đẻ.");
            post7.setContent(
                "<h2>Tại sao có khái niệm 'giai đoạn vàng'?</h2>\n" +
                "<p>Trước 6 tuổi, não bộ của trẻ có tính dẻo rất cao, khả năng tiếp thụ âm thanh và ngôn ngữ diễn ra thông qua bắt chước vô điều kiện mà không cần dịch nghĩa trong đầu. Đây là lý do tại sao trẻ nhỏ học ngoại ngữ thường phát âm chuẩn xác và tự nhiên hơn người lớn.</p>\n" +
                "<h2>Học như thế nào ở độ tuổi này để hiệu quả?</h2>\n" +
                "<p><b>Không học ngữ pháp hay viết bài:</b> Hãy cho trẻ tiếp xúc với tiếng Anh qua các bài hát thiếu nhi vui nhộn, truyện tranh và các trò chơi tương tác hình ảnh.</p>\n" +
                "<p><b>Tạo môi trường giao tiếp tự nhiên:</b> Thường xuyên nói chuyện bằng các mẫu câu tiếng Anh đơn giản hàng ngày và khuyến khích trẻ phản xạ bắt chước nói theo.</p>"
            );
            post7.setFaq(
                "[\n" +
                "  {\"q\": \"Học ngoại ngữ sớm có khiến trẻ bị loạn ngôn ngữ không?\", \"a\": \"Không. Não bộ trẻ em có khả năng phân tách tự nhiên giữa tiếng Việt và tiếng Anh nếu được hướng dẫn và tiếp xúc đúng cách.\"}\n" +
                "]"
            );
            post7.setCtaText("Đăng ký tư vấn lộ trình tiếng Anh thiếu nhi chuẩn Cambridge");
            post7.setCtaLink("#register-section");
            post7.setThumbnailUrl("https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=60");
            post7.setIsDeleted(false);
            blogPostRepository.save(post7);
        }

        // 9. Seed Free Materials (Additional)
        System.out.println("   -> Checking and Seeding Free Materials...");
        List<FreeMaterial> existingMaterials = freeMaterialRepository.findAll();

        if (existingMaterials.stream().noneMatch(m -> m.getTitle().equalsIgnoreCase("10 Cấu Trúc So Sánh Tiếng Anh Phổ Biến Nhất Cần Nắm Vững"))) {
            FreeMaterial m2 = new FreeMaterial();
            m2.setTitle("10 Cấu Trúc So Sánh Tiếng Anh Phổ Biến Nhất Cần Nắm Vững");
            m2.setDescription("Tổng hợp kiến thức chi tiết về so sánh bằng, so sánh hơn, so sánh nhất và so sánh kép (so sánh càng... càng...) kèm bài tập tự luyện trắc nghiệm.");
            m2.setContent(
                "<h2>1. So sánh bằng (Equality Comparison)</h2>\n" +
                "<p>Dùng để so sánh hai chủ thể có tính chất tương đương nhau.</p>\n" +
                "<p><b>Cấu trúc:</b> S + V + as + adj/adv + as + N/pronoun</p>\n" +
                "<p>- Ex: She runs as fast as her brother. (Cô ấy chạy nhanh bằng anh trai cô ấy).</p>\n\n" +
                "<h2>2. So sánh hơn (Comparative Comparison)</h2>\n" +
                "<p>Dùng để so sánh tính chất giữa hai đối tượng khác nhau.</p>\n" +
                "<ul>\n" +
                "  <li><b>Tính từ ngắn:</b> S + V + adj-er + than + N</li>\n" +
                "  <li><b>Tính từ dài:</b> S + V + more + adj + than + N</li>\n" +
                "</ul>\n" +
                "<p>- Ex: This book is more interesting than that one. (Quyển sách này thú vị hơn quyển sách kia).</p>\n\n" +
                "<h2>3. So sánh nhất (Superlative Comparison)</h2>\n" +
                "<p>Dùng để so sánh một đối tượng nổi trội nhất trong tập thể từ 3 đối tượng trở lên.</p>\n" +
                "<ul>\n" +
                "  <li><b>Tính từ ngắn:</b> S + V + the + adj-est + N</li>\n" +
                "  <li><b>Tính từ dài:</b> S + V + the most + adj + N</li>\n" +
                "</ul>"
            );
            m2.setFileUrl("");
            m2.setIsDeleted(false);
            FreeMaterial savedM2 = freeMaterialRepository.save(m2);

            // Add questions for Free Material 2
            FreeMaterialQuestion q1 = new FreeMaterialQuestion();
            q1.setMaterialId(savedM2.getId());
            q1.setQuestionNumber(1);
            q1.setQuestionText("This is ________ movie I have ever seen in my life.");
            q1.setQuestionType("MULTIPLE_CHOICE");
            q1.setOptions("A. the better|B. the best|C. best|D. more better");
            q1.setCorrectAnswer("B");
            freeMaterialQuestionRepository.save(q1);

            FreeMaterialQuestion q2 = new FreeMaterialQuestion();
            q2.setMaterialId(savedM2.getId());
            q2.setQuestionNumber(2);
            q2.setQuestionText("The hotter it gets, ________ he feels.");
            q2.setQuestionType("MULTIPLE_CHOICE");
            q2.setOptions("A. the more tired|B. more tired|C. the most tired|D. tiredest");
            q2.setCorrectAnswer("A");
            freeMaterialQuestionRepository.save(q2);
        }

        if (existingMaterials.stream().noneMatch(m -> m.getTitle().equalsIgnoreCase("Trọn Bộ 50 Động Từ Bất Quy Tắc Thông Dụng Nhất"))) {
            FreeMaterial m3 = new FreeMaterial();
            m3.setTitle("Trọn Bộ 50 Động Từ Bất Quy Tắc Thông Dụng Nhất");
            m3.setDescription("Tổng hợp danh sách 50 động từ bất quy tắc thường gặp nhất trong các kỳ thi và giao tiếp hàng ngày, kèm theo mẹo ghi nhớ nhanh và bài tập trắc nghiệm tự luyện.");
            m3.setContent(
                "<h2>1. Bảng động từ bất quy tắc thông dụng</h2>\n" +
                "<p>Dưới đây là một số động từ bất quy tắc vô cùng quen thuộc:</p>\n" +
                "<table border=\"1\" cellpadding=\"5\" style=\"border-collapse: collapse; width: 100%;\">\n" +
                "  <thead>\n" +
                "    <tr style=\"background-color: #f2f2f2;\">\n" +
                "      <th>Động từ nguyên mẫu (V1)</th>\n" +
                "      <th>Quá khứ đơn (V2)</th>\n" +
                "      <th>Quá khứ phân từ (V3)</th>\n" +
                "      <th>Nghĩa tiếng Việt</th>\n" +
                "    </tr>\n" +
                "  </thead>\n" +
                "  <tbody>\n" +
                "    <tr><td>go</td><td>went</td><td>gone</td><td>đi</td></tr>\n" +
                "    <tr><td>do</td><td>did</td><td>done</td><td>làm</td></tr>\n" +
                "    <tr><td>see</td><td>saw</td><td>seen</td><td>nhìn, thấy</td></tr>\n" +
                "    <tr><td>take</td><td>took</td><td>taken</td><td>lấy, cầm</td></tr>\n" +
                "    <tr><td>eat</td><td>ate</td><td>eaten</td><td>ăn</td></tr>\n" +
                "    <tr><td>write</td><td>wrote</td><td>written</td><td>viết</td></tr>\n" +
                "    <tr><td>speak</td><td>spoke</td><td>spoken</td><td>nói</td></tr>\n" +
                "    <tr><td>buy</td><td>bought</td><td>bought</td><td>mua</td></tr>\n" +
                "  </tbody>\n" +
                "</table>\n" +
                "<h2>2. Mẹo ghi nhớ động từ bất quy tắc</h2>\n" +
                "<ul>\n" +
                "  <li><b>Nhóm không đổi:</b> cut - cut - cut, put - put - put, hurt - hurt - hurt...</li>\n" +
                "  <li><b>Nhóm V2 và V3 giống nhau:</b> buy - bought - bought, send - sent - sent, build - built - built...</li>\n" +
                "  <li><b>Nhóm biến đổi theo nguyên âm i - a - u:</b> sing - sang - sung, drink - drank - drunk, swim - swam - swum...</li>\n" +
                "</ul>"
            );
            m3.setFileUrl("");
            m3.setIsDeleted(false);
            FreeMaterial savedM3 = freeMaterialRepository.save(m3);

            FreeMaterialQuestion q1 = new FreeMaterialQuestion();
            q1.setMaterialId(savedM3.getId());
            q1.setQuestionNumber(1);
            q1.setQuestionText("Yesterday, she ________ to the supermarket to buy some fruits.");
            q1.setQuestionType("MULTIPLE_CHOICE");
            q1.setOptions("A. go|B. goes|C. went|D. gone");
            q1.setCorrectAnswer("C");
            freeMaterialQuestionRepository.save(q1);

            FreeMaterialQuestion q2 = new FreeMaterialQuestion();
            q2.setMaterialId(savedM3.getId());
            q2.setQuestionNumber(2);
            q2.setQuestionText("He has ________ his homework already.");
            q2.setQuestionType("MULTIPLE_CHOICE");
            q2.setOptions("A. do|B. did|C. done|D. does");
            q2.setCorrectAnswer("C");
            freeMaterialQuestionRepository.save(q2);
        }

        if (existingMaterials.stream().noneMatch(m -> m.getTitle().equalsIgnoreCase("Bí Quyết Sử Dụng Giới Từ In, On, At Chỉ Thời Gian & Địa Điểm"))) {
            FreeMaterial m4 = new FreeMaterial();
            m4.setTitle("Bí Quyết Sử Dụng Giới Từ In, On, At Chỉ Thời Gian & Địa Điểm");
            m4.setDescription("Hướng dẫn chi tiết cách phân biệt giới từ In, On, At trong tiếng Anh để không bao giờ nhầm lẫn khi nói về thời gian và địa điểm, có bài tập thực hành.");
            m4.setContent(
                "<h2>1. Giới từ chỉ Thời gian (Time)</h2>\n" +
                "<ul>\n" +
                "  <li><b>AT:</b> Dùng cho thời gian cụ thể, thời điểm chính xác (giờ giấc, dịp lễ đặc biệt).\n" +
                "    <br/>- Ex: at 7 o'clock, at noon, at midnight, at Christmas.</li>\n" +
                "  <li><b>ON:</b> Dùng cho các ngày cụ thể trong tuần, ngày tháng, hoặc các ngày lễ có từ 'day'.\n" +
                "    <br/>- Ex: on Monday, on 15th October, on New Year's Day.</li>\n" +
                "  <li><b>IN:</b> Dùng cho các khoảng thời gian dài hơn (tháng, năm, mùa, thập kỷ, thế kỷ) hoặc các buổi trong ngày (trừ night).\n" +
                "    <br/>- Ex: in July, in 2026, in summer, in the morning.</li>\n" +
                "</ul>\n" +
                "<h2>2. Giới từ chỉ Địa điểm (Place)</h2>\n" +
                "<ul>\n" +
                "  <li><b>AT:</b> Chỉ một địa điểm cụ thể, địa chỉ chính xác hoặc một điểm mốc.\n" +
                "    <br/>- Ex: at 100 Nguyen Trai Street, at the bus stop, at home, at school.</li>\n" +
                "  <li><b>ON:</b> Chỉ vị trí trên bề mặt của một vật nào đó hoặc tên đường (không có số nhà).\n" +
                "    <br/>- Ex: on the table, on the wall, on Le Loi Street.</li>\n" +
                "  <li><b>IN:</b> Chỉ vị trí bên trong một không gian ba chiều hoặc một khu vực địa lý lớn (thành phố, quốc gia).\n" +
                "    <br/>- Ex: in the room, in Hanoi, in Vietnam.</li>\n" +
                "</ul>"
            );
            m4.setFileUrl("");
            m4.setIsDeleted(false);
            FreeMaterial savedM4 = freeMaterialRepository.save(m4);

            FreeMaterialQuestion q1 = new FreeMaterialQuestion();
            q1.setMaterialId(savedM4.getId());
            q1.setQuestionNumber(1);
            q1.setQuestionText("We will have a meeting ________ Monday morning.");
            q1.setQuestionType("MULTIPLE_CHOICE");
            q1.setOptions("A. in|B. on|C. at|D. for");
            q1.setCorrectAnswer("B");
            freeMaterialQuestionRepository.save(q1);

            FreeMaterialQuestion q2 = new FreeMaterialQuestion();
            q2.setMaterialId(savedM4.getId());
            q2.setQuestionNumber(2);
            q2.setQuestionText("My brother lives ________ a small apartment in Da Nang City.");
            q2.setQuestionType("MULTIPLE_CHOICE");
            q2.setOptions("A. in|B. on|C. at|D. to");
            q2.setCorrectAnswer("A");
            freeMaterialQuestionRepository.save(q2);
        }

        if (existingMaterials.stream().noneMatch(m -> m.getTitle().equalsIgnoreCase("Mẫu Câu Giao Tiếp Tiếng Anh Hàng Ngày Cho Người Mới Bắt Đầu"))) {
            FreeMaterial m5 = new FreeMaterial();
            m5.setTitle("Mẫu Câu Giao Tiếp Tiếng Anh Hàng Ngày Cho Người Mới Bắt Đầu");
            m5.setDescription("Trọn bộ các mẫu câu tiếng Anh giao tiếp thông dụng nhất trong cuộc sống hàng ngày giúp bạn tự tin phản xạ khi gặp gỡ người nước ngoài.");
            m5.setContent(
                "<h2>1. Chào hỏi và Làm quen (Greetings & Introductions)</h2>\n" +
                "<ul>\n" +
                "  <li><b>How have you been?</b> (Dạo này bạn thế nào? - Thân mật)</li>\n" +
                "  <li><b>Nice to meet you! / Pleased to meet you!</b> (Rất vui được gặp bạn!)</li>\n" +
                "  <li><b>Could you please tell me your name?</b> (Bạn có thể cho tôi biết tên của bạn được không?)</li>\n" +
                "</ul>\n" +
                "<h2>2. Đưa ra lời khuyên hoặc yêu cầu sự giúp đỡ (Asking for help)</h2>\n" +
                "<ul>\n" +
                "  <li><b>Could you do me a favor?</b> (Bạn có thể giúp tôi một việc được không?)</li>\n" +
                "  <li><b>Would you mind helping me with this?</b> (Bạn có phiền giúp tôi việc này không?)</li>\n" +
                "  <li><b>I really appreciate your help.</b> (Tôi thực sự trân trọng sự giúp đỡ của bạn.)</li>\n" +
                "</ul>\n" +
                "<h2>3. Cách hỏi thăm và bày tỏ sự cảm ơn (Gratitude & Inquiry)</h2>\n" +
                "<ul>\n" +
                "  <li><b>Thank you so much for your support!</b> (Cảm ơn bạn rất nhiều vì sự hỗ trợ!)</li>\n" +
                "  <li><b>No problem. / You're welcome.</b> (Không có chi/Không vấn đề gì.)</li>\n" +
                "  <li><b>Take care!</b> (Bảo trọng nhé!)</li>\n" +
                "</ul>"
            );
            m5.setFileUrl("");
            m5.setIsDeleted(false);
            FreeMaterial savedM5 = freeMaterialRepository.save(m5);

            FreeMaterialQuestion q1 = new FreeMaterialQuestion();
            q1.setMaterialId(savedM5.getId());
            q1.setQuestionNumber(1);
            q1.setQuestionText("A: Could you do me a favor? - B: ________");
            q1.setQuestionType("MULTIPLE_CHOICE");
            q1.setOptions("A. No, I am not|B. Yes, of course. What can I do for you?|C. You are welcome|D. Never mind");
            q1.setCorrectAnswer("B");
            freeMaterialQuestionRepository.save(q1);

            FreeMaterialQuestion q2 = new FreeMaterialQuestion();
            q2.setMaterialId(savedM5.getId());
            q2.setQuestionNumber(2);
            q2.setQuestionText("A: Thank you so much for helping me! - B: ________");
            q2.setQuestionType("MULTIPLE_CHOICE");
            q2.setOptions("A. It's my pleasure|B. Yes, I do|C. Excuse me|D. Goodbye");
            q2.setCorrectAnswer("A");
            freeMaterialQuestionRepository.save(q2);
        }

        if (existingMaterials.stream().noneMatch(m -> m.getTitle().equalsIgnoreCase("Cách Dùng Câu Điều Kiện Loại 1, 2 và 3 Cực Kỳ Dễ Hiểu"))) {
            FreeMaterial m6 = new FreeMaterial();
            m6.setTitle("Cách Dùng Câu Điều Kiện Loại 1, 2 và 3 Cực Kỳ Dễ Hiểu");
            m6.setDescription("Bài viết tổng hợp chi tiết cấu trúc, cách sử dụng và các ví dụ minh họa trực quan cho câu điều kiện loại 1, loại 2 và loại 3 kèm bài tập tự luyện.");
            m6.setContent(
                "<h2>1. Câu điều kiện loại 1 (Conditional Type 1)</h2>\n" +
                "<p>Diễn tả giả thuyết có thật, có thể xảy ra ở hiện tại hoặc tương lai.</p>\n" +
                "<p><b>Cấu trúc:</b> If + S + V(hiện tại đơn), S + will + V-inf</p>\n" +
                "<p>- Ex: If it rains, we will stay at home. (Nếu trời mưa, chúng tôi sẽ ở nhà).</p>\n\n" +
                "<h2>2. Câu điều kiện loại 2 (Conditional Type 2)</h2>\n" +
                "<p>Diễn tả giả thuyết không có thật, trái với thực tế ở hiện tại.</p>\n" +
                "<p><b>Cấu trúc:</b> If + S + V-ed/were, S + would/could + V-inf</p>\n" +
                "<p>- Ex: If I were you, I would buy that car. (Nếu tôi là bạn, tôi sẽ mua chiếc xe đó).</p>\n\n" +
                "<h2>3. Câu điều kiện loại 3 (Conditional Type 3)</h2>\n" +
                "<p>Diễn tả giả thuyết không có thật, trái với thực tế đã xảy ra trong quá khứ.</p>\n" +
                "<p><b>Cấu trúc:</b> If + S + had + V3/ed, S + would + have + V3/ed</p>\n" +
                "<p>- Ex: If they had studied harder, they would have passed the exam. (Nếu họ học chăm chỉ hơn, họ đã đỗ kỳ thi rồi).</p>"
            );
            m6.setFileUrl("");
            m6.setIsDeleted(false);
            FreeMaterial savedM6 = freeMaterialRepository.save(m6);

            FreeMaterialQuestion q1 = new FreeMaterialQuestion();
            q1.setMaterialId(savedM6.getId());
            q1.setQuestionNumber(1);
            q1.setQuestionText("If I ________ a lot of money, I would travel around the world.");
            q1.setQuestionType("MULTIPLE_CHOICE");
            q1.setOptions("A. have|B. had|C. will have|D. would have");
            q1.setCorrectAnswer("B");
            freeMaterialQuestionRepository.save(q1);

            FreeMaterialQuestion q2 = new FreeMaterialQuestion();
            q2.setMaterialId(savedM6.getId());
            q2.setQuestionNumber(2);
            q2.setQuestionText("If you ________ on time yesterday, you wouldn't have missed the flight.");
            q2.setQuestionType("MULTIPLE_CHOICE");
            q2.setOptions("A. arrive|B. arrived|C. had arrived|D. would arrive");
            q2.setCorrectAnswer("C");
            freeMaterialQuestionRepository.save(q2);
        }

        System.out.println("🌱 [DATABASE SEEDER] Database checking and seeding completed successfully!");
    }
}
