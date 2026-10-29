# Excalidraw cho Obsidian — Tiếng Việt / English

Bản tùy chỉnh từ [Excalidraw 2.29.0 của Zsolt Viczian](https://github.com/zsviczian/obsidian-excalidraw-plugin/releases/tag/2.29.0), giữ nguyên giấy phép MIT. Không phải bản phát hành chính thức của tác giả gốc.

## Cài đặt

Bản cài đã được đưa trực tiếp vào thư mục gốc repository: `main.js`, `styles.css`, `manifest.json`. Tải ba tệp này và chép vào `.obsidian/plugins/obsidian-excalidraw-plugin/`, giữ nguyên `data.json`, rồi khởi động lại Obsidian.

Mở **Cài đặt → Excalidraw → Ngôn ngữ plugin / Plugin language**, chọn **Tiếng Việt (vi)** hoặc **English (en)**. Khởi động lại Obsidian sau khi đổi để cập nhật hết tên lệnh và cửa sổ đang mở. Mặc định là tiếng Việt. Ngôn ngữ được lưu riêng cho plugin, không đổi ngôn ngữ Obsidian. Có lựa chọn ở cả giao diện cài đặt tìm kiếm mới và giao diện cũ.

ID plugin vẫn là `obsidian-excalidraw-plugin`; không cài hai bản cùng ID. Cập nhật từ danh mục Community plugins có thể ghi đè bằng bản gốc. **Chưa có GitHub Release, vì vậy chưa thể cài bằng BRAT.** Khi có Release đính kèm đủ ba tệp, có thể dùng BRAT với `donamgit151524/obsidian-excalidraw-vi`.

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

Vietnamese/English customization of Zsolt Viczian's Excalidraw 2.29.0, licensed under MIT. Install the three files from the repository root into your Excalidraw plugin folder. A GitHub Release has not been published, so BRAT installation is not available yet. Choose **Plugin language → Tiếng Việt (vi) / English (en)** and restart Obsidian to update all command names and open windows. Vietnamese is the default; the Obsidian language is unchanged. Keep your existing `data.json` when replacing the three release files.

See the original [README](README.md) for upstream documentation and licensing.
