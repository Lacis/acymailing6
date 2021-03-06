<?php

class acym_profile_widget extends WP_Widget
{
    public function __construct()
    {
        require_once(rtrim(dirname(dirname(__DIR__)), DS).DS.'back'.DS.'helpers'.DS.'helper.php');

        parent::__construct(
            'acym_profile_widget',
            acym_translation_sprintf('ACYM_MENU', acym_translation('ACYM_MENU_PROFILE')),
            ['description' => acym_translation('ACYM_MENU_PROFILE_DESC')]
        );
    }

    // Configuration
    public function form($instance)
    {
        require_once(rtrim(dirname(dirname(__DIR__)), DS).DS.'back'.DS.'helpers'.DS.'helper.php');

        acym_addStyle(false, ACYM_CSS.'widget.min.css?v='.filemtime(ACYM_MEDIA.'css'.DS.'widget.min.css'));

        $listClass = acym_get('class.list');
        $lists = $listClass->getAllWIthoutManagement();
        foreach ($lists as $i => $oneList) {
            if ($oneList->active == 0) {
                unset($lists[$i]);
            }
        }

        $params = [
            'title' => 'Your profile',
            'lists' => 'All',
            'listschecked' => 'All',
            'dropdown' => '0',
            'hiddenlists' => 'None',
            'fields' => '1',
            'introtext' => '',
            'posttext' => '',
            'source' => 'profile __i__',
        ];

        foreach ($params as $oneParam => &$value) {
            if (!empty($instance)) {
                if (isset($instance[$oneParam])) {
                    $value = $instance[$oneParam];
                } else {
                    $value = '';
                }
            }

            if (is_array($value)) {
                $value = implode(',', $value);
            }

            $value = esc_attr($value);
        }

        if (!isset($instance['hiddenlists']) && !empty($params['lists'])) {
            $params['hiddenlists'] = '';
        }

        echo '<div class="acyblock widget" id="mainopt_acywidget">
                <div class="widget-top">
                    <div class="widget-title-action">
                        <button type="button" class="widget-action hide-if-no-js" aria-expanded="false">
                            <span class="toggle-indicator" aria-hidden="true"></span>
                        </button>
                    </div>
                    <div class="widget-title"><h3>'.acym_translation('ACYM_MAIN_OPTIONS').'</h3></div>
                </div>
                <div class="widget-inside">';

        echo '<p><label class="acyWPconfig" for="'.$this->get_field_id('title').'">'.acym_translation('ACYM_TITLE').'</label>
			<input type="text" class="widefat" id="'.$this->get_field_id('title').'" name="'.$this->get_field_name('title').'" value="'.$params['title'].'" /></p>';


        echo '<p><label class="acyWPconfig" title="'.acym_translation('ACYM_VISIBLE_LISTS_DESC').'">'.acym_translation('ACYM_VISIBLE_LISTS').'</label>';
        echo acym_displayParam('lists', $params['lists'], $this->get_field_name('lists'));

        echo '<p><label class="acyWPconfig" title="'.acym_translation('ACYM_DROPDOWN_LISTS_DESC').'">'.acym_translation('ACYM_DROPDOWN_LISTS').'</label>';
        echo acym_boolean($this->get_field_name('dropdown'), $params['dropdown'], $this->get_field_id('dropdown')).'</p>';

        echo '<p><label class="acyWPconfig" title="'.acym_translation('ACYM_LISTS_CHECKED_DEFAULT_DESC').'">'.acym_translation('ACYM_LISTS_CHECKED_DEFAULT').'</label>';
        echo acym_displayParam('lists', $params['listschecked'], $this->get_field_name('listschecked'));

        echo '<p><label class="acyWPconfig" title="'.acym_translation('ACYM_AUTO_SUBSCRIBE_TO_DESC').'">'.acym_translation('ACYM_AUTO_SUBSCRIBE_TO').'</label>';
        echo acym_displayParam('lists', $params['hiddenlists'], $this->get_field_name('hiddenlists'));

        echo '<p><label class="acyWPconfig" title="'.acym_translation('ACYM_FIELDS_TO_DISPLAY_DESC').'">'.acym_translation('ACYM_FIELDS_TO_DISPLAY').'</label>';
        echo acym_displayParam('fields', $params['fields'], $this->get_field_name('fields'));

        echo '</div>
            </div>
            <div class="acyblock widget" id="advopt_acywidget">
                <div class="widget-top">
                    <div class="widget-title-action">
                        <button type="button" class="widget-action hide-if-no-js" aria-expanded="false">
                            <span class="toggle-indicator" aria-hidden="true"></span>
                        </button>
                    </div>
                    <div class="widget-title"><h3>'.acym_translation('ACYM_ADVANCED_OPTIONS').'</h3></div>
                </div>
                <div class="widget-inside">';

        echo '<p><label class="acyWPconfig" for="'.$this->get_field_id('introtext').'" title="'.acym_translation('ACYM_INTRO_TEXT_DESC').'">'.acym_translation('ACYM_INTRO_TEXT').'</label>
			<textarea class="widefat" id="'.$this->get_field_id('introtext').'" name="'.$this->get_field_name('introtext').'" >'.$params['introtext'].'</textarea></p>';

        echo '<p><label class="acyWPconfig" for="'.$this->get_field_id('posttext').'" title="'.acym_translation('ACYM_POST_TEXT_DESC').'">'.acym_translation('ACYM_POST_TEXT').'</label>
			<textarea class="widefat" id="'.$this->get_field_id('posttext').'" name="'.$this->get_field_name('posttext').'" >'.$params['posttext'].'</textarea></p>';

        echo '<p><label class="acyWPconfig" for="'.$this->get_field_id('source').'" title="'.acym_translation('ACYM_SOURCE_DESC').'">'.acym_translation('ACYM_SOURCE').'</label>
			<input type="text" class="widefat" id="'.$this->get_field_id('source').'" name="'.$this->get_field_name('source').'" value="'.$params['source'].'" /></p>';

        echo '</div></div>';
    }

    // Widget's output
    public function widget($args, $instance)
    {
        require_once rtrim(dirname(dirname(__DIR__)), DS).DS.'back'.DS.'helpers'.DS.'helper.php';
        if (!acym_isElementorEdition()) acym_loadAssets('frontusers', 'profile');

        echo $args['before_widget'];

        $title = apply_filters('widget_title', $instance['title']);
        if (!empty($title)) {
            echo $args['before_title'].$title.$args['after_title'];
        }

        acym_displayMessages();
        acym_setVar('page', 'front');
        $params = new acymParameter($instance);
        acym_initModule($params);

        $userController = acym_get('controller_front.frontusers');
        $data = $userController->prepareParams((object)$instance);
        acym_setVar('layout', 'profile');
        $userController->display($data);

        echo $args['after_widget'];
    }
}
