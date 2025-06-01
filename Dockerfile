FROM mcr.microsoft.com/playwright:v1.52.0-noble

WORKDIR /app

RUN apt-get update && \
    apt-get install -y wget curl && \
    curl -sSL https://dot.net/v1/dotnet-install.sh -o dotnet-install.sh && \
    chmod +x dotnet-install.sh && \
    ./dotnet-install.sh --channel 9.0 --install-dir /usr/share/dotnet && \
    rm dotnet-install.sh && \
    ln -sf /usr/share/dotnet/dotnet /usr/bin/dotnet && \
    rm -rf /var/lib/apt/lists/*

RUN dotnet --version

RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get install -y nodejs

COPY . .

# Install Angular dependencies and build
WORKDIR /app/clients/angular
RUN npm install
RUN npm run build

# Install eval (Playwright test) dependencies
WORKDIR /app/eval
RUN npm install

# Set the working directory back to eval for running tests
WORKDIR /app/eval

CMD ["npx", "playwright", "test"]