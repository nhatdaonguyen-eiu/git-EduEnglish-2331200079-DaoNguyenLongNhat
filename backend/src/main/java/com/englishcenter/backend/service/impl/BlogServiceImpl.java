package com.englishcenter.backend.service.impl;

import com.englishcenter.backend.dto.BlogPostDTO;
import com.englishcenter.backend.dto.BlogPostRequest;
import com.englishcenter.backend.entity.BlogPost;
import com.englishcenter.backend.repository.BlogPostRepository;
import com.englishcenter.backend.service.BlogService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * ================================================================
 * SERVICE IMPL: BlogServiceImpl
 * Triển khai nghiệp vụ CRUD bài viết, tự sinh Slug thân thiện SEO,
 * và seeding tự động bài viết mẫu khi khởi chạy.
 * ================================================================
 */
@Service
@RequiredArgsConstructor
public class BlogServiceImpl implements BlogService {

    private final BlogPostRepository blogPostRepository;

    @PostConstruct
    @Override
    public void initDefaultBlog() {
        // Gieo dữ liệu bài viết chuẩn SEO mẫu nếu DB chưa có bài nào
        if (blogPostRepository.count() == 0) {
            BlogPost samplePost = new BlogPost();
            samplePost.setTitle("Học IELTS bắt đầu từ đâu? Lộ trình tự học từ 0 lên 6.5 cực chi tiết");
            samplePost.setSlug("hoc-ielts-bat-dau-tu-dau-lo-trinh-tu-0-len-6.5-cuc-chi-tiet");
            
            samplePost.setSummary("Tự học IELTS từ con số 0 lên 6.5 là hoàn toàn khả thi nếu bạn có phương pháp đúng đắn. Lộ trình tối ưu nhất kéo dài từ 6 - 9 tháng, chia làm 2 chặng cốt lõi: Chặng 1 xây dựng nền tảng ngữ pháp/phát âm chuẩn (3 tháng) và Chặng 2 luyện kỹ năng giải đề chuyên sâu (3-6 tháng).");
            
            samplePost.setContent(
                "<h2>Chặng 1: Xây dựng nền tảng từ vựng và ngữ pháp cốt lõi (0 - 3.5 IELTS)</h2>\n" +
                "<p>Nhiều bạn vừa bắt tay vào học đã vội vàng giải đề ngay. Đây là một sai lầm nghiêm trọng khiến bạn dễ nản chí. Trong 3 tháng đầu tiên, hãy tập trung tối đa vào 3 mảnh ghép: Phát âm (Pronunciation), Từ vựng (Vocabulary) và Ngữ pháp (Grammar).</p>\n" +
                "<h3>1. Làm chủ phát âm chuẩn IPA</h3>\n" +
                "<p>Hãy học cách phát âm chuẩn xác 44 âm trong bảng phiên âm quốc tế IPA. Phát âm chuẩn là chìa khóa vàng giúp bạn Listening tốt hơn và Speaking tự nhiên hơn.</p>\n" +
                "<h3>2. Ngữ pháp cốt lõi và Từ vựng chủ đề</h3>\n" +
                "<p>Không cần học tất cả các cấu trúc ngữ pháp phức tạp. Hãy nắm vững 6 thì cơ bản trong tiếng Anh, cấu trúc câu điều kiện, mệnh đề quan hệ và so sánh. Đồng thời bổ sung từ vựng theo các chủ đề thông dụng hàng ngày.</p>\n\n" +
                "<h2>Chặng 2: Làm quen và chinh phục đề thi IELTS thực tế (3.5 - 6.5 IELTS)</h2>\n" +
                "<p>Khi đã có nền móng vững chắc, đây là thời điểm bạn tăng tốc bằng cách làm quen trực tiếp với cấu trúc đề thi IELTS 4 kỹ năng Nghe, Nói, Đọc, Viết.</p>\n" +
                "<h3>1. Chinh phục Listening & Reading</h3>\n" +
                "<p>Luyện tập phương pháp Skimming (đọc lướt) và Scanning (đọc quét) để tìm từ khóa trong bài Reading. Đối với Listening, hãy luyện kỹ năng nghe chép chính tả và nhận diện bẫy paraphrase.</p>\n" +
                "<h3>2. Nâng cấp Speaking & Writing</h3>\n" +
                "<p>Học cách xây dựng câu trả lời Speaking theo công thức A.R.E.A (Answer - Reason - Example - Alternative) để tăng tính mạch lạc. Ở kỹ năng Writing, hãy nắm chắc bố cục 4 phần tiêu chuẩn cho cả Task 1 và Task 2.</p>"
            );
            
            // Cấu trúc FAQ dạng JSON
            samplePost.setFaq(
                "[\n" +
                "  {\"q\": \"Tự học IELTS lên 6.5 mất bao lâu?\", \"a\": \"Thời gian trung bình dao động từ 6 đến 9 tháng tùy thuộc vào nền tảng tiếng Anh ban đầu và sự tập trung của bạn, trung bình cần 2 - 3 giờ học chất lượng mỗi ngày.\"},\n" +
                "  {\"q\": \"Nên luyện thi IELTS tại nhà hay đến trung tâm?\", \"a\": \"Nếu bạn có tính kỷ luật cao và khả năng tự nghiên cứu tốt, bạn có thể tự học tại nhà. Tuy nhiên, nếu bạn mất gốc và cần lộ trình khoa học cùng người sửa bài nói/viết, một khóa học cam kết đầu ra tại trung tâm sẽ là lựa chọn an toàn và tối ưu hơn.\"},\n" +
                "  {\"q\": \"Tài liệu nào tốt nhất cho người mới bắt đầu học IELTS?\", \"a\": \"Bạn nên bắt đầu với bộ Grammar in Use (ngữ pháp), Cambridge English Vocabulary in Use (từ vựng) và luyện phát âm qua kênh BBC Learning English.\"}\n" +
                "]"
            );
            
            samplePost.setCtaText("Nhận ngay Lộ trình học IELTS cam kết đầu ra MIỄN PHÍ");
            samplePost.setCtaLink("#register-section");
            samplePost.setThumbnailUrl("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60");
            samplePost.setIsDeleted(false);
            
            blogPostRepository.save(samplePost);
        }
    }

    @Override
    public List<BlogPostDTO> getAllBlogs() {
        return blogPostRepository.findByIsDeletedFalseOrderByCreatedAtDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BlogPostDTO getBlogById(Integer id) {
        BlogPost post = blogPostRepository.findById(id)
                .filter(p -> !p.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy bài viết với ID: " + id
                ));
        return toDTO(post);
    }

    @Override
    public BlogPostDTO getBlogBySlug(String slug) {
        BlogPost post = blogPostRepository.findBySlugAndIsDeletedFalse(slug)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy bài viết với Slug: " + slug
                ));
        return toDTO(post);
    }

    @Override
    public BlogPostDTO createBlog(BlogPostRequest request) {
        BlogPost post = toEntity(request);
        
        // Tự động sinh slug độc nhất
        String slugBase = generateSlug(request.getTitle());
        String finalSlug = slugBase;
        int count = 1;
        while (blogPostRepository.findBySlugAndIsDeletedFalse(finalSlug).isPresent()) {
            finalSlug = slugBase + "-" + count;
            count++;
        }
        post.setSlug(finalSlug);
        
        BlogPost saved = blogPostRepository.save(post);
        return toDTO(saved);
    }

    @Override
    public BlogPostDTO updateBlog(Integer id, BlogPostRequest request) {
        BlogPost post = blogPostRepository.findById(id)
                .filter(p -> !p.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy bài viết với ID: " + id
                ));

        // Cập nhật các trường
        post.setTitle(request.getTitle());
        post.setSummary(request.getSummary());
        post.setContent(request.getContent());
        post.setFaq(request.getFaq());
        post.setCtaText(request.getCtaText());
        post.setCtaLink(request.getCtaLink());
        post.setThumbnailUrl(request.getThumbnailUrl());

        // Sinh lại slug nếu đổi tiêu đề
        String slugBase = generateSlug(request.getTitle());
        if (!post.getSlug().startsWith(slugBase)) {
            String finalSlug = slugBase;
            int count = 1;
            while (blogPostRepository.findBySlugAndIsDeletedFalse(finalSlug).isPresent()) {
                finalSlug = slugBase + "-" + count;
                count++;
            }
            post.setSlug(finalSlug);
        }

        BlogPost updated = blogPostRepository.save(post);
        return toDTO(updated);
    }

    @Override
    public void deleteBlog(Integer id) {
        BlogPost post = blogPostRepository.findById(id)
                .filter(p -> !p.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy bài viết với ID: " + id
                ));
        post.setIsDeleted(true);
        blogPostRepository.save(post);
    }

    // ════════════════════════════════════════════════
    //  HELPERS — Bộ Sinh Slug & Ánh xạ dữ liệu
    // ════════════════════════════════════════════════

    private String generateSlug(String title) {
        if (title == null || title.trim().isEmpty()) {
            return "article-" + UUID.randomUUID().toString().substring(0, 8);
        }
        String temp = title.toLowerCase();
        
        // Thay thế các chữ tiếng Việt có dấu thành không dấu
        temp = temp.replaceAll("[àáạảãâầấậẩẫăằắặẳẵ]", "a");
        temp = temp.replaceAll("[èéẹẻẽêềếệểễ]", "e");
        temp = temp.replaceAll("[ìíịỉĩ]", "i");
        temp = temp.replaceAll("[òóọỏõôồốộổỗơờớợởỡ]", "o");
        temp = temp.replaceAll("[ùúụủũưừứựửữ]", "u");
        temp = temp.replaceAll("[ỳýỵỷỹ]", "y");
        temp = temp.replaceAll("đ", "d");
        
        // Loại bỏ ký tự đặc biệt, chỉ giữ chữ, số và khoảng trắng
        temp = temp.replaceAll("[^a-z0-9\\s-]", "");
        // Thay thế các khoảng trắng/nhiều gạch ngang thành 1 gạch ngang
        temp = temp.replaceAll("[\\s-]+", "-");
        // Bỏ các gạch ngang dư thừa ở đầu và cuối
        temp = temp.trim();
        if (temp.startsWith("-")) temp = temp.substring(1);
        if (temp.endsWith("-")) temp = temp.substring(0, temp.length() - 1);
        
        return temp.isEmpty() ? "article-" + UUID.randomUUID().toString().substring(0, 8) : temp;
    }

    private BlogPostDTO toDTO(BlogPost post) {
        BlogPostDTO dto = new BlogPostDTO();
        dto.setId(post.getId());
        dto.setTitle(post.getTitle());
        dto.setSlug(post.getSlug());
        dto.setSummary(post.getSummary());
        dto.setContent(post.getContent());
        dto.setFaq(post.getFaq());
        dto.setCtaText(post.getCtaText());
        dto.setCtaLink(post.getCtaLink());
        dto.setThumbnailUrl(post.getThumbnailUrl());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());
        return dto;
    }

    private BlogPost toEntity(BlogPostRequest request) {
        BlogPost post = new BlogPost();
        post.setTitle(request.getTitle());
        post.setSummary(request.getSummary());
        post.setContent(request.getContent());
        post.setFaq(request.getFaq());
        post.setCtaText(request.getCtaText());
        post.setCtaLink(request.getCtaLink());
        post.setThumbnailUrl(request.getThumbnailUrl());
        post.setIsDeleted(false);
        return post;
    }
}
