import { QuestionCircleOutlined } from '@ant-design/icons'
// import EmojiPicker from '@renderer/components/EmojiPicker'
import { HStack } from '@renderer/components/Layout'
import { TopView } from '@renderer/components/TopView'
import { DEFAULT_CONTEXTCOUNT, DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE } from '@renderer/config/constant'
import { TRANSLATE_PROMPT } from '@renderer/config/prompts'
import { useTheme } from '@renderer/context/ThemeProvider'
import { useDefaultAssistant } from '@renderer/hooks/useAssistant'
import { useSettings } from '@renderer/hooks/useSettings'
import { AssistantSettings as AssistantSettingsType } from '@renderer/types'
import { modalConfirm } from '@renderer/utils'
import { Button, Col, InputNumber, Modal, Row, Switch, Tooltip } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { Dispatch, FC, SetStateAction, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { setTranslateModelPrompt } from '@renderer/store/settings'
import { SettingContainer, SettingSubtitle } from '..'
import { useAppDispatch } from '@renderer/store'

const TranslateModelSettings: FC = () => {
  const { defaultAssistant, updateDefaultAssistant } = useDefaultAssistant()
  const [enableMaxTokens, setEnableMaxTokens] = useState(defaultAssistant?.settings?.enableMaxTokens ?? false)
  const [maxTokens, setMaxTokens] = useState(defaultAssistant?.settings?.maxTokens ?? 0)
  const { translateModelPrompt } = useSettings()

  const { theme } = useTheme()

  const { t } = useTranslation()

  const dispatch = useAppDispatch()

  const onUpdateTranslateModelSettings = (settings: Partial<AssistantSettingsType>) => {
    // updateDefaultAssistant({
    //   ...defaultAssistant,
    //   settings: {
    //     ...defaultAssistant.settings,
    //     maxTokens: settings.maxTokens ?? maxTokens
    //   }
    // })
  }

  const handleChange =
    (setter: Dispatch<SetStateAction<number>>, updater: (value: number) => void) => (value: number | null) => {
      if (!!value && !isNaN(value)) {
        setter(value)
        updater(value)
      }
    }
  const onMaxTokensChange = handleChange(setMaxTokens, (value) => onUpdateTranslateModelSettings({ maxTokens: value }))

  // Reset 重置内容：
  // 1. 关闭最大token
  // 2. 设置最大token为0
  // 3. 重置prompt为默认prompt
  const onReset = () => {
    setEnableMaxTokens(false)
    setMaxTokens(0)
    dispatch(setTranslateModelPrompt(TRANSLATE_PROMPT))
    updateDefaultAssistant({
      ...defaultAssistant,
      settings: {
        ...defaultAssistant.settings,
        temperature: DEFAULT_TEMPERATURE,
        contextCount: DEFAULT_CONTEXTCOUNT,
        enableMaxTokens: false,
        maxTokens: DEFAULT_MAX_TOKENS,
        streamOutput: true,
        topP: 1
      }
    })
  }

  return (
    <SettingContainer style={{ height: 'auto', background: 'transparent', padding: 0 }} theme={theme}>
      <SettingSubtitle>{t('common.prompt')}</SettingSubtitle>
      <TextArea
        rows={4}
        // placeholder={t('common.assistant') + t('common.prompt')}
        placeholder={'请输入翻译模型提示词'}
        value={translateModelPrompt}
        onChange={(e) => dispatch(setTranslateModelPrompt(e.target.value))}
        style={{ margin: '10px 0' }}
        spellCheck={false}
      />
      <SettingSubtitle
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}>
        {t('settings.assistant.model_params')}
        {(translateModelPrompt !== TRANSLATE_PROMPT || enableMaxTokens) && (
          <Button onClick={onReset} style={{ width: 90 }}>
            {t('chat.settings.reset')}
          </Button>
        )}
      </SettingSubtitle>
      <Row align="middle" style={{ marginBottom: 10 }}>
        <HStack alignItems="center">
          <Label>{t('chat.settings.max_tokens')}</Label>
          <Tooltip title={t('chat.settings.max_tokens.tip')}>
            <QuestionIcon />
          </Tooltip>
        </HStack>
        <Switch
          style={{ marginLeft: 10 }}
          checked={enableMaxTokens}
          onChange={async (enabled) => {
            if (enabled) {
              const confirmed = await modalConfirm({
                title: t('chat.settings.max_tokens.confirm'),
                content: t('chat.settings.max_tokens.confirm_content'),
                okButtonProps: {
                  danger: true
                }
              })
              if (!confirmed) return
            }

            setEnableMaxTokens(enabled)
            updateTranslateAssistant({
              ...translateAssistant,
              settings: {
                ...translateAssistant.settings,
                enableMaxTokens: enabled
              }
            })
          }}
        />
      </Row>
      {enableMaxTokens && (
        <Row align="middle" gutter={20}>
          <Col span={24}>
            <InputNumber
              disabled={!enableMaxTokens}
              min={0}
              max={10000000}
              step={100}
              value={maxTokens}
              changeOnBlur
              onChange={onMaxTokensChange}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>
      )}
    </SettingContainer>
  )
}

interface Props {
  resolve: (data: any) => void
}

const PopupContainer: React.FC<Props> = ({ resolve }) => {
  const [open, setOpen] = useState(true)
  const { t } = useTranslation()

  const onOk = () => {
    setOpen(false)
  }

  const onCancel = () => {
    setOpen(false)
  }

  const onClose = () => {
    resolve({})
  }

  TranslateModelSettingsPopup.hide = onCancel

  return (
    <Modal
      title={t('settings.assistant.title')}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      afterClose={onClose}
      centered
      width={800}
      footer={null}>
      <TranslateModelSettings />
    </Modal>
  )
}

const TopViewKey = 'TranslateModelSettingsPopup'

export default class TranslateModelSettingsPopup {
  static topviewId = 0
  static hide() {
    TopView.hide(TopViewKey)
  }
  static show() {
    return new Promise<any>((resolve) => {
      TopView.show(
        <PopupContainer
          resolve={(v) => {
            resolve(v)
            TopView.hide(TopViewKey)
          }}
        />,
        TopViewKey
      )
    })
  }
}

const Label = styled.p`
  margin: 0;
  font-size: 14px;
  margin-right: 5px;
`

const QuestionIcon = styled(QuestionCircleOutlined)`
  font-size: 14px;
  cursor: pointer;
  color: var(--color-text-3);
`
