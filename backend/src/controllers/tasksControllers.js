export const getAllTasks = (req, res) => {
    res.status(200).send("Bạn có 0 công việc");
};

export const createTask = (req, res) => {
    res.status(201).json({ message: "Thêm công việc thành công" });
};

export const updateTask = (req, res) => {
    res.status(200).json({ message: "Cập nhật công việc thành công" });
};

export const deleteTask = (req, res) => {
    res.status(200).json({ message: "Xóa công việc thành công" });
};
