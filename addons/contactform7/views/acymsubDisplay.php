<?php
printf(
    '<span class="wpcf7-form-control-wrap %1$s"><span %2$s>',
    sanitize_html_class($data['tagName']),
    'class="'.$data['class'].'" '
);

foreach ($data['detailsLists']['displayLists'] as $listId) {
    $check = '';
    if (in_array($listId, $data['detailsLists']['defaultLists'])) {
        $check = 'checked="checked"';
    }
    $idInput = 'acylist_'.$listId.'_field_'.$data['tagName'];
    ?>

	<span class="onelist wpcf7-list-item">
		<input type="checkbox" class="acym_checkbox" name="<?php echo $data['tagName']; ?>[]" id="<?php echo $idInput; ?>" <?php echo $check; ?> value="<?php echo $listId; ?>" />
		<label for="<?php echo $idInput; ?>"><?php echo $data['listNames'][$listId]; ?></label>
	</span>
    <?php
}

$acymmail = '';
foreach ($data['tag']->options as $oneOption) {
    if (strpos($oneOption, 'acymmail:') !== false) {
        $optionExploded = explode(':', $oneOption);
        $acymmail .= $optionExploded[1];
    }
}
$acymData = 'data-acymfield="'.$data['tagName'].'" data-acymmail="'.$acymmail.'"';
?>

<input type="hidden" name="acymhiddenlists_<?php echo $data['tagName']; ?>" <?php echo $acymData; ?> value="<?php echo implode(',', $data['detailsLists']['autoLists']); ?>" />
<input type="hidden" name="acymaction_<?php echo $data['tagName']; ?>" value="<?php echo $data['acymSubmitUrl']; ?>" />
</span><?php echo $data['validationError']; ?></span>
