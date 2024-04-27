import copy


class PageFunction:
    def __init__(self, request, queryset, page_size=10, page_param="page"):
        page = request.GET.get(page_param, 1)
        self.query_dict = copy.deepcopy(request.GET)
        self.query_dict._mutable = True
        if request.GET.get(page) is not None:
            self.query_dict.setlist('page', [request.GET.get(page)])
        else:
            self.query_dict.setlist('page', [1])
        page = int(page)
        if page <= 0:
            page = 1
        self.page = page
        self.page_size = page_size
        self.start = (page - 1) * page_size
        self.end = page * page_size
        self.page_queryset = queryset[self.start: self.end]
        self.total_data_count = queryset.count()
        self.total_page_count = int(self.total_data_count / page_size) + 1

    def html(self):
        total_page = []
        start_page = self.page - 5
        if start_page <= 0:
            start_page = 1

        end_page = self.page + 5
        if end_page > self.total_page_count:
            end_page = self.total_page_count + 1

        for i in range(start_page, end_page):
            total_page.append(i)
        return total_page, self.query_dict.urlencode()
