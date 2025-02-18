import * as React from 'react'
import { useState, useEffect } from 'react'
import { Layout as AntLayout, Button, Avatar } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, CloseOutlined } from '@ant-design/icons'
import { WorldTocPanel } from '../world_toc'
import { PreferencesContext } from '../infoview/context'

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
  const [touchStart, setTouchStart] = useState(null)
  const { mobile } = React.useContext(PreferencesContext)

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e) => {
    if (!touchStart || isCollapsed) return

    const currentTouch = e.touches[0].clientX
    const diff = touchStart - currentTouch

    // 如果向左滑动超过50px，关闭侧边栏
    if (diff > 50) {
      setIsCollapsed(true)
      setTouchStart(null)
    }
  }

  const handleTouchEnd = () => {
    setTouchStart(null)
  }

  return (
    <AntLayout style={{ height: '100vh', overflow: 'hidden' }}>
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
            zIndex: mobile ? 1001 : 1,
            transform: `translateX(${isCollapsed ? '-300px' : '0'})`,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {mobile && (
            <Button
              type="primary"
              danger
              icon={<CloseOutlined />}
              onClick={() => setIsCollapsed(true)}
              style={{
                position: 'absolute',
                right: 16,
                top: 16,
                fontSize: '18px',
                padding: '8px 16px',
                height: 'auto',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                zIndex: 1000
              }}
            />
          )}
          <div style={{ padding: 16, paddingTop: 80 }}>
            <WorldTocPanel
              worlds={worlds}
              worldToc={worldToc}
              worldSize={worldSize}
              rulesHelp={rulesHelp}
              setRulesHelp={setRulesHelp}
              setIsCollapsed={setIsCollapsed}
              mobile={mobile}
            />
          </div>
        </Sider>
      )}
      {mobile && !isCollapsed && (
        <div
          role="button"
          tabIndex={10}
          aria-label="Close sidebar"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            zIndex: 900,
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent'
          }}
          onClick={() => setIsCollapsed(true)}
        />
      )}
      <AntLayout style={{
        marginLeft: showSidebar && !isCollapsed && !mobile ? 300 : 0,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: '100vh',
        position: 'relative'
      }}>

        <Header style={{
          padding: '0 12px',
          background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          width: '100%',
          zIndex: 800,
          height: '48px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {showSidebar && (
              <Button
                type="text"
                icon={isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setIsCollapsed(!isCollapsed)}
                style={{
                  fontSize: '20px',
                  width: 32,
                  height: 32,
                  color: '#fff',
                  padding: '0px',
                  margin: '0px'
                }}
              />
            )}
          </div>
        </Header>
        <Content style={{
          margin: 0,
          padding: 0,
          minHeight: 280,
          overflow: 'auto'
        }}>
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  )
}
