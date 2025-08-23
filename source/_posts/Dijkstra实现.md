---
title: Dijkstra实现
date: 2024-10-29 13:52:52
tags: 
- 算法
- Python
categories: 生活中的图算法作业报告
---
### 代码展示
```python
cities_num = int(input("输入城市数量 "))
cities_distance = input("输入城市距离矩阵: ").split()
distance_matrix = [[int(cities_distance[i+j]) for j in range(cities_num)]
                   for i in range(0, len(cities_distance), cities_num)]

def dijkstra(distance_matrix, start):
    length=len(distance_matrix)
    mins=[float('inf')]*length
    path=[-1]*length
    mins[start]=0
    visted=[False]*length
    for i in range(length):
        min_index=-1
        for j in range(length):
            if not visted[j] and (min_index==-1 or mins[j]<mins[min_index]):
                min_index=j
        if min_index==-1:
            break
        visted[min_index]=True
        for j in range(length):
            if not visted[j] and distance_matrix[min_index][j]>0 and (mins[j]>mins[min_index]+distance_matrix[min_index][j]):
                mins[j]=mins[min_index]+distance_matrix[min_index][j]
                path[j]=min_index
    return mins,path    


for i in range(cities_num):
    end = i
    start = 0
    mins, path = dijkstra(distance_matrix, start)
    print("最短路径长度为: ", mins[end])
    print("最短路径为: ")
    temp = end
    while temp != -1:
        print(temp, end=" ")
        temp = path[temp]
    print()

```