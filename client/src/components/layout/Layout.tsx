import * as React from 'react'
import { useState } from 'react'
import { Layout as AntLayout, Button } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { WorldTocPanel } from '../world_toc'

const { Header, Sider, Content } = AntLayout

interface LayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
  worlds?: any
  worldToc?: any
  worldSize?: any
  rulesHelp?: boolean
  setRulesHelp?: (value: boolean) => void
}

export function Layout({
  children,
  showSidebar = true,
  worlds,
  worldToc,
  worldSize,
  rulesHelp,
  setRulesHelp
}: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const drawerWidth = 300

  return (
    <AntLayout style={{ height: '100%' }}>
      {showSidebar && (
        <Sider
          trigger={null}
          collapsible
          collapsed={isCollapsed}
          width={300}
          collapsedWidth={0}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
          }}
        >
          <div style={{ padding: 16 }}>
            <WorldTocPanel
              worlds={worlds}
              worldToc={worldToc}
              worldSize={worldSize}
              rulesHelp={rulesHelp}
              setRulesHelp={setRulesHelp}
            />
          </div>
        </Sider>
      )}
      <AntLayout style={{
        marginLeft: showSidebar && !isCollapsed ? 300 : 0,
        transition: 'margin-left 0.2s'
      }}>
        <Button
          type="text"
          icon={isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            position: 'fixed',
            left: isCollapsed ? 20 : 300,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 100,
            width: 40,
            height: 40,
            background: '#1890ff',
            color: '#fff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'left 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        />
        <Content style={{
          margin: '24px 16px',
          padding: 24,
          minHeight: 280,
          overflow: 'auto'
        }}>
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  )
}
