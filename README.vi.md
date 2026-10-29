# Excalidraw cho Obsidian — Tiếng Việt / English

Bản tùy chỉnh từ [Excalidraw 2.29.0 của Zsolt Viczian](https://github.com/zsviczian/obsidian-excalidraw-plugin/releases/tag/2.29.0), giữ nguyên giấy phép MIT. Không phải bản phát hành chính thức của tác giả gốc.

## Cài bằng BRAT

1. Cài và bật BRAT trong Obsidian.
2. Chọn **BRAT → Add beta plugin** và nhập `donamgit151524/obsidian-excalidraw-vi`.
3. Cài bản phát hành mới nhất, rồi bật Excalidraw.
4. Mở **Cài đặt → Excalidraw → Ngôn ngữ plugin / Plugin language**.
5. Chọn **Tiếng Việt (vi)** hoặc **English (en)**, rồi khởi động lại Obsidian để đổi hết tên lệnh và cửa sổ đang mở.

Mặc định là tiếng Việt. Lựa chọn được lưu riêng trong cấu hình Excalidraw và không đổi ngôn ngữ của Obsidian. Có mục chọn ngôn ngữ ở cả giao diện cài đặt tìm kiếm mới và giao diện cài đặt cũ.

ID plugin vẫn là `obsidian-excalidraw-plugin`; không cài song song hai bản cùng ID. Có thể chép `main.js`, `styles.css`, `manifest.json` từ Release vào `.obsidian/plugins/obsidian-excalidraw-plugin/`. Giữ tệp `data.json` của bạn. Dùng BRAT để theo dõi bản Việt hóa, vì cập nhật từ danh mục Community plugins có thể ghi đè bằng bản gốc.

## Phạm vi

- Bộ dịch của plugin: cài đặt, hộp thoại, trình đơn, lệnh, thông báo, nhập/xuất PDF, ảnh Markdown, thanh bên, OCR, AI và tập lệnh.
- Đủ 644 khóa của bảng vẽ: công cụ, thuộc tính, màu, thư viện, gợi ý phím tắt, xuất ảnh và thông báo.
- Bộ tiếng Anh gốc vẫn được giữ. Các ví dụ mã, URL, tên biến mẫu, khóa dữ liệu, ID lệnh và định dạng bản vẽ được kiểm tra để giữ nguyên.
- Tên sản phẩm, tên phông chữ, mã kỹ thuật, tài liệu và lịch sử phát hành upstream vẫn có thể bằng tiếng Anh. Nội dung do người dùng hoặc tập lệnh cộng đồng cung cấp không tự dịch.
- Bản nháp tiếng Việt được tạo bằng công cụ dịch cho văn bản giao diện công khai, sau đó hiệu chỉnh thuật ngữ, nhãn chính và bảo toàn cú pháp bằng các công cụ trong `scripts/`. Có thể tiếp tục góp ý cách diễn đạt qua repository.

Plugin chạy bản dịch cục bộ; không gọi dịch vụ dịch khi sử dụng. Công cụ `scripts/translate-vi.cjs` dành riêng cho phát triển, chỉ gửi chuỗi giao diện công khai khi được chạy thủ công; không chạy trong bản cài và không đọc ghi chú hoặc `data.json`.

## Biên dịch và kiểm tra

Yêu cầu Node.js 22 trở lên và npm 10 trở lên:

```sh
npm ci
node scripts/verify-vi.cjs
npm run build
```

Ba tệp cài đặt nằm trong `dist/`. `scripts/canvas-locale.mjs` ghép từ điển tiếng Việt đầy đủ vào payload Excalidraw trong bộ nhớ lúc build; không sửa trực tiếp dependency trong `node_modules`. Mã kiểm tra xác nhận đủ khóa Việt/Anh, biến mẫu, ví dụ mã và chuyển ngôn ngữ qua bộ nạp nén thực tế. Kết quả nằm trong `translation-report.json`.

## English

Vietnamese/English customization of Zsolt Viczian's Excalidraw 2.29.0, licensed under MIT. Install with BRAT using `donamgit151524/obsidian-excalidraw-vi`. Choose **Plugin language → Tiếng Việt (vi) / English (en)** and restart Obsidian to update all command names and open windows. Vietnamese is the default; the Obsidian language is unchanged. Keep your existing `data.json` when replacing the three release files.

See the original [README](README.md) for upstream documentation and licensing.
