/**
 * BLOCK: partners-slider
 *
 * Registering a basic block with Gutenberg.
 * Simple block, renders and saves the same content without any interactivity.
 */

//  Import CSS.
import "./editor.scss";
import "./style.scss";

const { __ } = wp.i18n; // Import __() from wp.i18n
import {
	MediaUpload,
	MediaUploadCheck,
	PlainText,
} from "@wordpress/block-editor";
const { registerBlockType } = wp.blocks; // Import registerBlockType() from wp.blocks

/**
 * Register: aa Gutenberg Block.
 *
 * Registers a new block provided a unique name and an object defining its
 * behavior. Once registered, the block is made editor as an option to any
 * editor interface where blocks are implemented.
 *
 * @link https://wordpress.org/gutenberg/handbook/block-api/
 * @param  {string}   name     Block name.
 * @param  {Object}   settings Block settings.
 * @return {?WPBlock}          The block, if it has been successfully
 *                             registered; otherwise `undefined`.
 */
registerBlockType("cgb/block-partners-slider", {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: __("partners-slider - CGB Block"), // Block title.
	icon: "shield", // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
	category: "common", // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.
	keywords: [
		__("partners-slider — CGB Block"),
		__("CGB Example"),
		__("create-guten-block"),
	],
	attributes: {
		id: {
			source: "attribute",
			selector: "div.slide",
			attribute: "id",
		},
		showButtons: { type: "boolean", default: true },
		autoPlay: { type: "number", default: 5000 },
		partners: {
			source: "query",
			default: [],
			selector: "div.partner",
			query: {
				index: { source: "text", selector: "span.partner-index" },
				image: {
					source: "attribute",
					selector: "img",
					attribute: "src",
				},
			},
		},
	},

	/**
	 * The edit function describes the structure of your block in the context of the editor.
	 * This represents what the editor will render when the block is used.
	 *
	 * The "edit" property must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 *
	 * @param {Object} props Props.
	 * @returns {Mixed} JSX Component.
	 */
	edit: (props) => {
		const { attributes, className, setAttributes } = props;
		const { partners, showButtons, autoPlay } = attributes;

		const ALLOWED_MEDIA_TYPES = ["image"];

		if (!attributes.id) {
			const id = `partner${Math.floor(Math.random() * 100)}`;
			setAttributes({
				id,
			});
		}

		const partnerList = partners
			.sort((a, b) => a.index - b.index)
			.map((partner) => {
				return (
					<div key={partner.index} className="partner-slider">
						<button
							className="remove-partner"
							onClick={() => {
								const newPartners = partners
									.filter((item) => item.index !== partner.index)
									.map((t) => {
										if (t.index > partner.index) {
											t.index -= 1;
										}

										return t;
									});

								setAttributes({
									partners: newPartners,
								});
							}}
						>
							x
						</button>
						<div className="wp-block-partner-quote">
							<div className="wp-block-partner-content">
								<figure className="partner__picture">
									<MediaUploadCheck>
										<MediaUpload
											onSelect={(media) => {
												const image = media.sizes.medium
													? media.sizes.medium.url
													: media.url;
												const newObject = Object.assign({}, partner, {
													image,
												});
												setAttributes({
													partners: [
														...partners.filter(
															(item) => item.index !== partner.index
														),
														newObject,
													],
												});
											}}
											allowedTypes={ALLOWED_MEDIA_TYPES}
											type="image"
											value={partner.image}
											render={({ open }) =>
												partner.image ? (
													<img
														className="partner__picture__image"
														src={partner.image}
														onClick={open}
													/>
												) : (
													<button
														href="#"
														className="partner__picture__image"
														onClick={open}
													>
														Select Image
													</button>
												)
											}
										/>
									</MediaUploadCheck>
								</figure>
							</div>
						</div>
					</div>
				);
			});

		const handleButtons = () => {
			setAttributes({ showButtons: !showButtons });
		};

		return (
			<div className={className}>
				<button
					className="add-more-partner"
					onClick={() =>
						setAttributes({
							partners: [
								...attributes.partners,
								{
									index: attributes.partners.length,
									url: "",
									title: "",
									content: "",
									author: "",
								},
							],
						})
					}
				>
					+
				</button>
				<label className="show-button" for="show-button">
					Show Buttons
				</label>
				<input
					type="checkbox"
					id="show-button"
					name="show-button"
					checked={showButtons}
					onClick={handleButtons}
				/>
				<label className="auto-play-label" for="auto-play">
					Auto Play(ms):
				</label>
				<PlainText
					id="auto-play"
					name="auto-play"
					className="auto-play"
					value={autoPlay}
					autoFocus
					onChange={(value) => setAttributes({ autoPlay: value })}
				/>
				<div className="partner-slider-wrapper">{partnerList}</div>
			</div>
		);
	},

	/**
	 * The save function defines the way in which the different attributes should be combined
	 * into the final markup, which is then serialized by Gutenberg into post_content.
	 *
	 * The "save" property must be specified and must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 *
	 * @param {Object} props Props.
	 * @returns {Mixed} JSX Frontend HTML.
	 */
	save: ({ attributes }) => {
		const { id, partners, showButtons, autoPlay } = attributes;
		const partnersList = partners.map((partner) => {
			return (
				<div
					className="carousel-cell partner-slider partner"
					key={partner.index}
				>
					<span className="partner-index" style={{ display: "none" }}>
						{partner.index}
					</span>
					<div className="wp-block-partner-content-front">
						{partner.image && (
							<figure className="partner__picture">
								<img className="partner__picture__image" src={partner.image} />
							</figure>
						)}
					</div>
				</div>
			);
		});

		if (partners.length > 0) {
			const str = `{ "groupCells": true, "freeScroll": true, "draggable": true, "contain": true, "autoPlay": ${autoPlay}, "pauseAutoPlayOnHover": false, "prevNextButtons": ${showButtons}, "pageDots": ${showButtons} }`;

			return (
				<div className="carousel" data-flickity={str} id={id}>
					{partnersList}
				</div>
			);
		}
		return null;
	},
});
