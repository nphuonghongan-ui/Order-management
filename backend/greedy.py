def greedy_bin_packing_clusters(items, max_v=67.0, max_w=26000.0):
    """
    items: Danh sách dict, mỗi item có: 'id', 'v' (thể tích), 'w' (trọng lượng)
    """
    # 1. Sắp xếp thùng hàng giảm dần theo thể tích
    sorted_items = sorted(items, key=lambda x: x['v'], reverse=True)
    
    # Danh sách các container (mỗi container là một cụm chứa các item)
    containers = [] 
    
    # 2. Duyệt qua từng thùng hàng để gom cụm
    for item in sorted_items:
        placed = False
        for cont in containers:
            # Kiểm tra xem cont hiện tại còn đủ sức chứa (thể tích & tải trọng) không
            if cont['current_v'] + item['v'] <= max_v and cont['current_w'] + item['w'] <= max_w:
                cont['items'].append(item)
                cont['current_v'] += item['v']
                cont['current_w'] += item['w']
                placed = True
                break
        
        # Nếu không cont nào chứa vừa, mở cont mới
        if not placed:
            new_cont = {
                'items': [item],
                'current_v': item['v'],
                'current_w': item['w']
            }
            containers.append(new_cont)
            
    return containers # Trả về các cụm đã gom