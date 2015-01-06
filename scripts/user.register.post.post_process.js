var data = {
    "email": event.response.email
};

var result = platform.api.post("http://localhost:8529/_db/fiplus/extensions/userfi/register", JSON.stringify(data));

print(result + "\n");