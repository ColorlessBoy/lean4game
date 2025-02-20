FROM node:20
# 设置代理环境变量
ENV HTTP_PROXY=http://host.docker.internal:7890
ENV HTTPS_PROXY=http://host.docker.internal:7890

# Install essential packages
RUN apt-get update && apt-get install -y \
    curl \
    git \
    python3 \
    python3-pip \
    wget \
    build-essential \
    bubblewrap \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g npm

# make sure binaries are available even in non-login shells
ENV PATH="/root/.elan/bin:/root/.local/bin:$PATH"

COPY server/lean-toolchain /lean-toolchain

# install elan
# 安装指定版本的 Lean
RUN curl https://raw.githubusercontent.com/leanprover/elan/master/elan-init.sh -sSf | sh -s -- -y --default-toolchain none && \
    . /root/.profile && \
    elan toolchain install $(cat /lean-toolchain) && \
    elan default $(cat /lean-toolchain) && \
    /root/.elan/bin/elan --version # 使用绝对路径检查 elan 是否安装成功

# 设置 ELAN_HOME 环境变量
ENV ELAN_HOME="/root/.elan"

# Set working directory
WORKDIR /lean4game

# Copy the current directory
COPY . /lean4game

# build server
RUN rm -rf node_modules && rm -rf server/.lake && npm install && npm run build

# build game
RUN mkdir -p games/colorlessboy && cd games/colorlessboy && git clone https://github.com/ColorlessBoy/Lean4QuickStart lean4quickstart && cd lean4quickstart && lake build

# Expose ports
EXPOSE 3000 8080

# Set default command
CMD ["npm", "run", "production"]
